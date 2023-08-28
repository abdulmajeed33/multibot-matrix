import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function extractVideoId(url: string): string | null {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get("v");
}

//
import axios from "axios";

type VideoMetadata = {
  videoTitle: string;
  videoDescription: string;
  videoId: string;
};

export async function getVideoMetaData(
  videoId: string
): Promise<VideoMetadata | undefined> {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.GOOGLE_API_KEY}&part=snippet,contentDetails,statistics,status`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    const metadata = data.items[0];

    console.log("GetMetadata", { metadata });

    const videoTitle = metadata.snippet.title;
    const videoDescription = metadata.snippet.description;
    const shortenedDescription = videoDescription.split(".")[0];

    const videoInfo: VideoMetadata = {
      videoTitle,
      videoDescription: shortenedDescription,
      videoId,
    };

    return videoInfo;
  } catch (error) {
    console.error(`Failed to fetch video metadata: ${error}`);
    return undefined;
  }
}
