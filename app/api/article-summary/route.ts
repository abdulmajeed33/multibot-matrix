import axios from "axios";
import { NextResponse } from "next/server";

const rapidApiKey = process.env.VITE_RAPID_API_ARTICLE_KEY; // Use process.env to access environment variables
const options = {
  method: "GET",
  url: "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
  params: {
    url: "https://time.com/6266679/musk-ai-open-letter/",
    length: "3",
  },
  headers: {
    "X-RapidAPI-Key": rapidApiKey,
    "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
  },
};
export async function POST(req: Request) {
  if (req.method === "GET") {
    const body = await req.json();
    const { articleUrl } = body;
    console.log("articleUrl", articleUrl);
    try {
      const response = await axios.post(`/api/article-summary`, {
        articleUrl,
      });
      console.log("response", response.data);
      NextResponse.json(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      NextResponse.json({ error: "Internal server error" });
    }
  } else {
    NextResponse.json({ error: "Method not allowed" });
  }
}
