import React, { ChangeEvent, useState } from "react";
import PromptBox from "@/app/custom-components/PromptBox";
import Title from "@/app/custom-components/Title";
import TwoColumnLayout from "@/app/custom-components/TwoColumnLayout";
import ResultWithSources from "@/app/custom-components/ResultWithSources";
import "../globals.css";
import PageHeader from "@/app/custom-components/PageHeader";

interface Message {
  text: string;
  type: "bot" | "user";
  sourceDocuments: null | any[]; // You should replace 'any[]' with the actual type of 'sourceDocuments'
}

const Memory: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<null | string>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! What's your name and favourite food?",
      type: "bot",
      sourceDocuments: null,
    },
  ]);
  const [firstMsg, setFirstMsg] = useState<boolean>(true);

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmitPrompt = async () => {
    console.log("sending ", prompt);
    try {
      // Update the user message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await fetch("/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt, firstMsg }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setPrompt("");
      // So we don't reinitialize the chain
      setFirstMsg(false);
      const searchRes = await response.json();
      // Add the bot message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: searchRes.output.response, type: "bot", sourceDocuments: null },
      ]);

      // console.log({ searchRes });
      // Clear any old error messages
      setError("");
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <>
      <Title headingText={"Memory"} emoji="🧠" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="I remember everything"
              boldText="Let's see if it can remember your name and favourite food. This tool will let you ask anything contained in a PDF document. "
              description="This tool uses Buffer Memory and Conversation Chain.  Head over to Module X to get started!"
            />
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages as Message[]} pngFile="brain" />
            <PromptBox
              prompt={prompt}
              handleSubmit={handleSubmitPrompt}
              error={error!}
              handlePromptChange={handlePromptChange}
            />
          </>
        }
      />
    </>
  );
};

export default Memory;
