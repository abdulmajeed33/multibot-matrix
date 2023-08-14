import { NextApiRequest, NextApiResponse } from "next";
import { YoutubeTranscript } from "youtube-transcript";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { NextResponse } from "next/server";

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

let chain: ConversationalRetrievalQAChain;
let chatHistory: ChatHistoryItem[] = [];

const initializeChain = async (initialPrompt: string, transcript: string) => {
  try {
    // Initialize model with GPT-3.5
    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo",
    });

    // Create a text splitter, we use a smaller chunk size and chunk overlap since we are working with small sentences
    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 7,
      chunkOverlap: 3,
    });

    // Using the splitter, we create documents from a bigger document, in this case the YouTube Transcript
    const docs = await splitter.createDocuments([transcript]);

    // console.log(`Loading data ${docs[0]}`);

    // Upload chunks to database as documents
    // We'll be using HNSWLib for this one.
    // The nice thing about this one is that we don't need to create any accounts or get any API keys besides our OpenAI key to use this library
    // So I find that it's nice for doing some quick prototyping.
    // But the downside is that you don't get the nice dashboard like we had in Pinecone.
    const vectorStore = await HNSWLib.fromDocuments(
      [{ pageContent: transcript, metadata: {} }],
      new OpenAIEmbeddings()
    );

    // Just to show you, we'll also save the vector store as a file in case you want to retrieve it later.
    // We'll copy our root directory and save it as a variable
    const directory = "/Users/shawnesquivel/GitHub/yt-script-generator/";
    await vectorStore.save(directory);
    //  it will create some files for us, including a way for us to view the vector store documents which is helpful.
    // then you can access it like this:
    const loadedVectorStore = await HNSWLib.load(
      directory,
      new OpenAIEmbeddings()
    );

    // The ConversationalRetrievalQA chain builds on RetrievalQAChain to provide a chat history component.

    // To create one, you will need a retriever. In the below example, we will create one from a vectorstore, which can be created from embeddings.

    // Remember we can use the loadedVectorStore or the vectorStore, in case for example you want to scale this application up and use the same vector store to store multiple Youtube transcripts.
    chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      { verbose: true } // Add verbose option here
    );

    // It requires two inputs: a question and the chat history. It first combines the chat history and the question into a standalone question, then looks up relevant documents from the retriever, and then passes those documents and the question to a question answering chain to return a response.
    const response = await chain.call({
      question: initialPrompt,
      chat_history: chatHistory,
    });

    // Update history
    chatHistory.push({
      role: "assistant",
      content: response.text,
    });

    console.log({ chatHistory });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export async function POST(req: Request) {
  if (req.method === "POST") {
    // If it's a POST request, extract prompt and firstMsg from the request body
    const body = await req.json();
    const { prompt, firstMsg } = body;

    // If it's the first message, initialize the chain
    if (firstMsg) {
      console.log("Initializing chain");

      try {
        // Set the initial prompt by asking for a summary of the transcript
        const initialPrompt = `Give me a summary of the transcript: ${prompt}`;

        // Push the initial user message to chat history
        chatHistory.push({
          role: "user",
          content: initialPrompt,
        });

        // Fetch the transcript of the YouTube video using the YouTubeTranscript API
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(
          prompt
        );

        // Handle error if transcript fetch fails
        if (!transcriptResponse) {
          return NextResponse.json({ error: "Failed to get transcript" });
        }

        // Combine the transcript lines into a single string
        let transcript = "";
        transcriptResponse.forEach((line: { text: string }) => {
          transcript += line.text;
        });

        // Initialize the chain with the initial prompt and transcript
        const response = await initializeChain(initialPrompt, transcript);

        // console.log("Chain:", chain);
        console.log(response);

        // Return the response and chat history
        return NextResponse.json({ output: response, chatHistory });
      } catch (err) {
        console.error(err);
        return NextResponse.json({
          error: "An error occurred while fetching transcript",
        });
      }
    } else {
      // If it's not the first message, continue the conversation with the chatbot
      console.log("Received question");

      try {
        console.log("Asking:", prompt);
        console.log("Chain:", chain);

        // Push the user's message to chat history
        chatHistory.push({
          role: "user",
          content: prompt,
        });

        // Continue the conversation with the chatbot using the existing chat history
        const response = await chain.call({
          question: prompt,
          chat_history: chatHistory,
        });

        // Push the chatbot's response to chat history
        chatHistory.push({
          role: "assistant",
          content: response.text,
        });

        // Return the response and updated chat history
        return NextResponse.json({ output: response, chatHistory });
      } catch (error) {
        console.error(error);
        NextResponse.json({
          error: "An error occurred during the conversation.",
        });
      }
    }
  }
}
