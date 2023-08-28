import { NextResponse } from "next/server";

import { YoutubeTranscript } from "youtube-transcript";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { extractVideoId, getVideoMetaData } from "@/lib/utils";
import ResearchAgent from "@/agents/ResearchAgent";
import { auth } from "@clerk/nextjs";
import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

// Global Variables
let chain: LLMChain | undefined;
let chatHistory: { role: "user" | "assistant"; content: string }[] = [];
let transcript = "";
let metadataString = "";
let research: string | undefined;

// Initialize Chain with Data
const initChain = async (
  transcript: string,
  metadataString: string,
  research: string | undefined,
  topic: string
) => {
  try {
    const llm = new ChatOpenAI({
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
    });

    console.log(`Initializing Chat Prompt`);

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a helpful social media assistant that provides research, new content, and advice to me. \n You are given the transcript of the video: {transcript} \n and video metadata: {metadata} as well as additional research: {research}"
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "{input}. Remember to use the video transcript and research as reference."
      ),
    ]);

    const question = `Write me a script for a new video that provides commentary on this video in a lighthearted, joking manner. It should compliment ${topic} with puns.`;
    console.log(question);

    chain = new LLMChain({
      prompt: chatPrompt,
      llm: llm,
    });

    const response = await chain.call({
      transcript,
      metadata: metadataString,
      research,
      input: question,
    });

    console.log({ response });

    chatHistory.push({
      role: "assistant",
      content: response.text,
    });

    return response;
  } catch (error: any) {
    console.error(
      `An error occurred during the initialization of the Chat Prompt: ${error?.message}`
    );
    throw error;
  }
};

export async function POST(req: Request) {
  const { userId } = auth();
  const body = await req.json();
  const { prompt, topic, firstMsg } = body;
  console.log(`Prompt: ${prompt} Topic: ${topic}`);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new NextResponse("OpenAI API Key not configured.", {
      status: 500,
    });
  }

  const freeTrial = await checkApiLimit();
  const isPro = await checkSubscription();

  if (!freeTrial && !isPro) {
    return new NextResponse("Free trial has expired. Please upgrade to pro.", {
      status: 403,
    });
  }

  if (
    chain === undefined &&
    !prompt.includes("https://www.youtube.com/watch?v=")
  ) {
    return NextResponse.json({
      error:
        "Chain not initialized. Please send a YouTube URL to initialize the chain.",
    });
  }

  chatHistory.push({
    role: "user",
    content: prompt,
  });

  if (firstMsg) {
    console.log("Received URL");
    try {
      const videoId = extractVideoId(prompt);
      const transcriptResponse = await YoutubeTranscript.fetchTranscript(
        prompt
      );
      transcriptResponse.forEach((line) => {
        transcript += line.text;
      });

      if (!transcriptResponse) {
        return NextResponse.json({ error: "Failed to get transcript" });
      }

      const metadata = await getVideoMetaData(videoId!);
      metadataString = JSON.stringify(metadata, null, 2);
      console.log({ metadataString });

      research = await ResearchAgent(topic);
      console.log({ research });

      const response = await initChain(
        transcript,
        metadataString,
        research,
        topic
      );

      return NextResponse.json({
        output: response,
        chatHistory,
        transcript,
        metadata,
        research,
      });
    } catch (err) {
      console.error(err);
      return NextResponse.json({
        error: "An error occurred while fetching transcript",
      });
    }
  } else {
    console.log("Received question");
    try {
      const question = prompt;

      console.log("Asking:", question);
      console.log("Using old chain:", chain);

      const response = await chain!.call({
        transcript,
        metadata: metadataString,
        research,
        input: question,
      });

      chatHistory.push({
        role: "assistant",
        content: response.text,
      });
      if (!isPro) {
        await incrementApiLimit();
      }
      return NextResponse.json({
        output: response,
        metadata: metadataString,
        transcript,
        chatHistory,
      });
    } catch (error) {
      console.error(error);
      NextResponse.json({
        error: "An error occurred during the conversation.",
      });
    }
  }
}
