import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

const rapidApiKey = process.env.VITE_RAPID_API_ARTICLE_KEY; // Use process.env to access environment variables

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { articleUrl } = body;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!articleUrl) {
      return new NextResponse("URL is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired. Please upgrade to pro.",
        { status: 403 }
      );
    }

    const options = {
      method: "GET",
      url: "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
      params: {
        url: articleUrl,
        length: "3",
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
      },
    };
    const response = await axios.request(options);
    const summarizedContent = response.data.summary; // Extract the summarized content
    if (!isPro) {
      await incrementApiLimit();
    }
    console.log("response", response);
    return new NextResponse(JSON.stringify({ summary: summarizedContent }), {});
  } catch (error) {
    console.error("Error fetching summary:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
