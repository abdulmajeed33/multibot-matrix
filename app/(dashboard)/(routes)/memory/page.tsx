"use client";
import React, { ChangeEvent, useState } from "react";
import Title from "@/app/custom-components/Title";
import TwoColumnLayout from "@/app/custom-components/TwoColumnLayout";
import ResultWithSources from "@/app/custom-components/ResultWithSources";
import PageHeader from "@/app/custom-components/PageHeader";
import "@/app/globals.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl, Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./constants";
import { Input } from "@/components/ui/input";


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

  const form = useForm<z.infer<typeof formSchema>>(
    {
      resolver: zodResolver(formSchema),
      defaultValues: {
        prompt: ""
      }
    });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Update the user message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: values.prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await axios.post("/api/memory", {
        input: values.prompt,
        firstMsg
      });

      if (response.status !== 200) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      setPrompt("");
      // So we don't reinitialize the chain
      setFirstMsg(false);
      const searchRes = await response.data;
      // Add the bot message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: searchRes.output.response, type: "bot", sourceDocuments: null },
      ]);

      // Clear any old error messages
      setError(null);
    } catch (err: any) {
      setError(err.message);
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
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
              "
                >
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="col-span-12 lg:col-span-8">
                        <FormControl className="m-0 p-0">
                          <Input
                            className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                            disabled={isLoading}
                            placeholder="Enter Your Prompt Here"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* error message */}
                  <p className={`text-red-500 ${error ? "block" : "hidden"}`}>
                    {error}
                  </p>
                  <Button className="col-span-12 lg:col-span-4 w-full" type="submit" disabled={isLoading} size="icon">
                    Generate
                  </Button>
                </form>
              </Form>
            </div>
          </>
        }
      />
    </>
  );
};

export default Memory;
