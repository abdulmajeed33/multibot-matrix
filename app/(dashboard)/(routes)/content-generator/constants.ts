import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
  topic: z.string().min(1, {
    message: "Topic is required.",
  }),
});
