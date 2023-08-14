"use client"
import React, { ChangeEvent, useState } from "react";
import { NextPage } from "next";
import axios from "axios";

import Title from "@/app/custom-components/Title";
import TwoColumnLayout from "@/app/custom-components/TwoColumnLayout";
import PageHeader from "@/app/custom-components/PageHeader";
import ResultWithSources from "@/app/custom-components/ResultWithSources";
import PromptBox from "@/app/custom-components/PromptBox";
import ButtonContainer from "@/app/custom-components/ButtonContainer";
import Button from "@/app/custom-components/Button";

interface Message {
  text: string;
  type: "bot" | "user";
  sourceDocuments: any[] | null; // Adjust this type as per your actual data structure
}

const PDFLoader: NextPage = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File>();

  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi, I'm a Naval AI. What would you like to know?",
      type: "bot",
      sourceDocuments: null,
    },
  ]);
  const [error, setError] = useState<string>("");

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFiles(file);
    }
  };

  const handleSubmit = async (endpoint: string) => {
    try {
      console.log(`sending ${prompt}`);
      console.log(`using ${endpoint}`);
      // const formData = new FormData();
      // formData.append("file", selectedFiles as Blob);
      const response = await axios.post(`/api/${endpoint}`); // Use Axios GET request

      const searchRes = response.data;
      console.log(searchRes);
      setError("");
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    }
  };

  const handleSubmitPrompt = async (endpoint: string) => {
    try {
      setPrompt("");

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await axios.post(`/api/${endpoint}`, { input: prompt }); // Use Axios POST request

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const searchRes = response.data;

      console.log({ searchRes });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes.result.text,
          type: "bot",
          sourceDocuments: searchRes.result.sourceDocuments,
        },
      ]);

      setError("");
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    }
  };

  return (
    <>
      <Title emoji="💬" headingText="PDF-GPT" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="Ask Naval Anything"
              boldText="How to get rich? How to be happy?"
              description="This tool will let you ask anything contained in a PDF document. This tool uses Embeddings, Pinecone, VectorDBQAChain, and VectorStoreAgents. Head over to Module 1 to get started!"
            />
            <ButtonContainer>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
              <Button
                handleSubmit={(endpoint: string) => handleSubmit(endpoint)}
                buttonText="Upload Book 📚"
                className="Button"
                endpoint="document-upload"
              // disabled={!selectedFiles}
              />
            </ButtonContainer>
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile="pdf" />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={() => handleSubmitPrompt("document-query")}
              placeHolderText="Enter Your Prompt here"
              error={error}
            />

          </>
        }
      />
    </>
  );
};

export default PDFLoader;
