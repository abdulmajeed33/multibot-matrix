import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextResponse } from "next/server";

/**
 *
 * WARNING: THIS IS THE SOLUTION! Please try coding before viewing this.
 *
 */

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export async function POST(req: Request) {
  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }
    const body = await req.json();

    console.log("Query PDF");

    // Grab the user prompt
    const { input } = body;

    if (!input) {
      throw new Error("No input");
    }

    console.log("input received:", input);

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX!);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    /* Part Two: Use as part of a chain (currently no metadata filters) */

    const model = new OpenAI({ modelName: "gpt-3.5-turbo", temperature: 0.8 });
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    });
    const response = await chain.call({ query: input });

    console.log(response);

    return NextResponse.json({ result: response });
  } catch (error: any) {
    console.error(error);
    NextResponse.json({ message: error.message });
  }
}
