"use client";
import React, { useState } from "react";
import { formSchema } from "./constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChatCompletionRequestMessage } from "openai";
import toast from "react-hot-toast";
import { z } from "zod";
import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { FormField, FormItem, FormControl, Form } from "@/components/ui/form";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/heading";
import axios from "axios";



const ContentGenerator: React.FC = () => {
  const [firstMsg, setFirstMsg] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "https://www.youtube.com/watch?v=Il72uEjs4o0",
      topic: "India Chandrayaan 3",
    }
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionRequestMessage = { role: "user", content: values.prompt };
      const newMessages = [...messages, userMessage];

      const response = await axios.post(`/api/content-generator`, {
        prompt: values.prompt,
        topic: values.topic,
        firstMsg,
      });

      const searchRes = response.data;
      setMessages((current) => [...current, userMessage, searchRes.output]);

      console.log({ searchRes });
      form.reset();

      setFirstMsg(false);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 403) {
        // Handle this case accordingly
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  return (
    <>
      <div>
        <Heading
          title="Content Generator"
          description="Hi there! I'm your personal YouTube video script generator. If you give me a YouTube URL and topic, I can transform it into a unique video script. Send me a YouTube URL to get started."
          icon={MessageSquare}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <div className="px-4 lg:px-8">
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
                    <FormItem className="col-span-12 lg:col-span-10">
                      <FormControl className="m-0 p-0">
                        <Input
                          className="p-3 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          disabled={isLoading}
                          placeholder="Yuotube URL"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-10">
                      <FormControl className="m-0 p-0">
                        <Input
                          className="p-3 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          disabled={isLoading}
                          placeholder="Topic"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button className="col-span-12 lg:col-span-2 w-full flex justify-center items-center" type="submit" disabled={isLoading} size="icon">
                  Generate
                </Button>
              </form>
            </Form>
          </div>
          <div className="space-y-4 mt-4">
            {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                <Loader />
              </div>
            )}
            {messages?.length === 0 && !isLoading && (
              <Empty label="No conversation started." />
            )}
            <div className="flex flex-col-reverse gap-y-4">
              {messages?.map((message) => (
                <div
                  key={message?.content}
                  className={cn(
                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                    message?.role === "user" ? "bg-white border border-black/10" : "bg-muted",
                  )}
                >
                  {message?.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <p className="text-sm">
                    {message?.content ?? message?.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentGenerator;
