import express from "express";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "grocery-store",
});

const upload = async () => {
  const pdfPath = "./grocery_store_items.pdf";
  const buffer = fs.readFileSync(pdfPath); //return buffer //Buffer is a global, built-in class used to directly handle and manipulate raw binary data
  const pdfResult = new PDFParse({ data: buffer }); //Initialize the parser with the buffer
  const result = await pdfResult.getText(); //Extract the text from each page req-page.
  const text = result.text; // extract whole text only- no chunking for now.
  //then perform
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
  });
  const splited_docs = await splitter.createDocuments([text]);
  await vectorStore.addDocuments(splited_docs);
  console.log("embendings saved");
};

// upload();

// setup llm
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.7, //creativity of model-response: 0-> strict response, tepm>0 -> creativity & long response
  maxTokens: 100, //generate response with maxtoken range.
  maxRetries: 2,
});

// with langchain CHATBOT
app.post("/chat", async (req, res) => {
  const { input } = req.body;

  const docs = await vectorStore.similaritySearch(input, 5);
  const context = docs.map((d) => d.pageContent).join("/n");

  const response = await llm.invoke([
    new SystemMessage(`You are RAG AI asistent. 
    STRICT RULES:
    - Answer only from context
    - Do not use outside knowledge
    - If answer not found say: "i don't know from uploaded PDF.
    
    context: ${context}`),
    new HumanMessage(input),
  ]);

  res.status(200).json({ ai: response.content });
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "helo from server" });
});

app.listen(port, () => {
  console.log(`Server is Listen on ${port}`);
});
