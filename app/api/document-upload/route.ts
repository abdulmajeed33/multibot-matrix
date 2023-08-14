import { NextApiRequest, NextApiResponse } from "next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { NextResponse } from "next/server";
import formidable from "formidable";
import path from "path";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
// let fs = require("fs");

// const readFile = (
//   req: Request,
//   saveLocally: boolean
// ): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
//   const options: formidable.Options = {};
//   if (saveLocally) {
//     options.uploadDir = path.join(process.cwd(), "media/uploaded_documents");
//     options.filename = (name, ext, path, from) => {
//       return Date.now().toString() + "_" + path.originalFilename;
//     };
//   }
//   const form = formidable(options);
//   return new Promise((resolve, reject) => {
//     form.parse(req as any, (err, fields, files) => {
//       if (err) reject(err);
//       return resolve({ fields, files });
//     });
//   });
// };

export async function POST(req: Request) {
  try {
    // await fs.readdir(path.join(process.cwd(), "media/uploaded_documents"));
    // await readFile(req, true);

    // Enter your code here
    /** STEP ONE: LOAD DOCUMENT */
    const bookPath =
      "/home/abdulmajeed/weekend-projects/next13-ai-saas/media/uploaded_documents/Policy Manual V1_9623 (1).pdf";
    const loader = new PDFLoader(bookPath);

    const docs = await loader.load();

    if (docs.length === 0) {
      console.log("No documents found.");
      return;
    }

    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 250,
      chunkOverlap: 10,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Reduce the size of the metadata for each document -- lots of useless pdf information
    const reducedDocs = splitDocs.map((doc) => {
      if (doc?.metadata) {
        const reducedMetadata = { ...doc.metadata };
        delete reducedMetadata.pdf; // Remove the 'pdf' field
        return new Document({
          pageContent: doc.pageContent,
          metadata: reducedMetadata,
        });
      }
      return doc; // If metadata is not defined, return the original doc
    });

    console.log(docs[100]);
    console.log(splitDocs[100]?.metadata);
    console.log(reducedDocs[100]?.metadata);

    /** STEP TWO: UPLOAD TO DATABASE */

    const client = new PineconeClient();

    await client.init({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX!);

    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });

    console.log("Successfully uploaded to DB");
    // Modify output as needed
    return NextResponse.json({
      result: `Uploaded to Pinecone! Before splitting: ${docs.length}, After splitting: ${splitDocs.length}`,
    });
  } catch (error) {
    console.error(error);
    // await fs.mkdir(path.join(process.cwd(), "media/uploaded_documents"));
    return NextResponse.json({ message: "Internal Error" });
  }
}
