import { SerpAPI, SerpAPIParameters } from "langchain/tools";

/**
 *
 * WARNING: THIS IS THE SOLUTION! Please try coding before viewing this.
 *
 */

const SerpAPITool = (): SerpAPI => {
  const serpAPI = new SerpAPI(process.env.SERPAPI_API_KEY, {
    // baseUrl: "http://localhost:3000/agents",
    location: "Pakistan,Karachi",
    hl: "en",
    gl: "us",
  });
  serpAPI.returnDirect = true;

  return serpAPI;
};

export default SerpAPITool;
