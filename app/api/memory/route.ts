import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { NextResponse } from "next/server";

let model: OpenAI | undefined;
let memory: BufferMemory | undefined;
let chain: ConversationChain | undefined;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, firstMsg } = body;

    if (!input) {
      return new NextResponse("Input is required", { status: 400 });
    }

    if (firstMsg) {
      console.log("initializing chain");
      model = new OpenAI({ modelName: "gpt-3.5-turbo" });
      memory = new BufferMemory();
      chain = new ConversationChain({ llm: model, memory: memory });
    }

    const response = await chain?.call({ input });
    return NextResponse.json({ output: response });
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
