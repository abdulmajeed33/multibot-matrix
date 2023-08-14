"use client";
import React, { useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests
import PageHeader from "@/app/custom-components/PageHeader";
import PromptBox from "@/app/custom-components/PromptBox";
import ResultWithSources from "@/app/custom-components/ResultWithSources";
import TwoColumnLayout from "@/app/custom-components/TwoColumnLayout";
import Title from "@/app/custom-components/Title";


const VideoChat: React.FC = () => {
  const [prompt, setPrompt] = useState(
    "https://www.youtube.com/watch?v=0lJKucu6HJc"
  );
  const [error, setError] = useState<string | null>(null);
  const [firstMsg, setFirstMsg] = useState<boolean>(true);

  const [messages, setMessages] = useState<
    Array<{
      text: string;
      type: "user" | "bot";
      sourceDocuments: any;
    }>
  >([
    {
      text:
        "Hi there! I'm YT chatbot. Please provide a YouTube video URL and I'll answer any questions you have.",
      type: "bot",
      sourceDocuments: null,
    },
  ]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await axios.post(`/api/video-chat`, {
        prompt: prompt,
        firstMsg: firstMsg,
      });

      console.log({ response });
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const searchRes = response.data;

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes?.output?.text,
          type: "bot",
          sourceDocuments: null,
        },
      ]);

      setPrompt("");
      setFirstMsg(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error fetching transcript. Please try again.");
    }
  };

  return (
    <>
      <Title emoji="💬" headingText="YouTube Video Chat" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="Talk to Your Videos"
              boldText="This tool lets you chat with your YouTube videos. "
              description="This tool uses the YouTube API, Text Splitters, and the Conversational Retrieval QA CHain.  Head over to Module X to get started!"
            />
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile="youtube" />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleSubmit}
              placeHolderText={
                messages.length === 1
                  ? "Enter a youtube url, e.g., https://www.youtube.com/watch?v=O_9JoimRj8w"
                  : "Ask a follow up question"
              }
              error={error!}
            />
          </>
        }
      />
    </>
  );
};

export default VideoChat;
