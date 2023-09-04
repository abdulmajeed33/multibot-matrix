/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "googleusercontent.com",
      "oaidalleapiprodscus.blob.core.windows.net",
      "cdn.openai.com",
    ],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    VITE_RAPID_API_ARTICLE_KEY: process.env.VITE_RAPID_API_ARTICLE_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  },
};

module.exports = nextConfig;
