import { OpenAI } from "langchain";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
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
      model = new OpenAI({
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(tokens) {
              process.stdout.write(tokens);
            },
          },
        ],
      });
      memory = new BufferMemory();
      chain = new ConversationChain({ llm: model!, memory: memory! });
    }

    const response = await chain?.call({ input });
    console.log("response", response!);
    return new NextResponse(JSON.stringify({ output: response }), {
      status: 200,
    });
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Assuming you have a separate function or script where you execute the model call
// (async () => {
//   try {
//     await model?.call();
//   } catch (error) {
//     console.error("Model call error:", error);
//   }
// })();
