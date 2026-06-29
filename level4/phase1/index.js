import express from "express";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

//  implementation of langGraph
// create new tool [ tavilyhserch pkg that webserch if llm not have data about query]
const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const checkPointer = new MemorySaver(); //import {MemorySaver} from "@langchain/langgraph";

const tools = [tool];
const toolNode = new ToolNode(tools); //runs tools

// setup llm
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.7, //creativity of model-response: 0-> strict response, tepm>0 -> creativity & long response
  maxTokens: 100, //generate response with maxtoken range.
  maxRetries: 2,
}).bindTools(tools); //so llm can use tools

// function that cell llm
const callLLM = async (state) => {
  const response = await llm.invoke([
    {
      role: "system",
      content: `Your are Jarvis AI assistant, user conversation memory first.

      Only use tools when the answer requires external real-time information like: weather, news, web search, stock prices etc.
      
      Do NOT call tools for simple conversation, memory-based questions, greetings, or personal context.`,
    },
    ...state.messages,
  ]);

  return { messages: [response] };
};

// function for conditionalEdges -agent-shouldcontinue
const shouldContinue = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls.length > 0) {
    return "tools";
  } else {
    return "__end__";
  }
};

// create graph for ai workflow - using langgraph
const graph = new StateGraph(MessagesAnnotation) //built-in state of langchain
  .addNode("agent", callLLM) // nodename 'agent' jo 'callLLM' function ko cell kry ga
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent") // edges bnai or start node ko agent node sy connect kr dia
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue) //agent node sy 'shouldContinue' func run hoga to check kry ga 'tool call' ya 'end node'
  .compile({ checkpointer: checkPointer });

// with langchain CHATBOT
app.post("/chat", async (req, res) => {
  const { input } = req.body;

  const response = await graph.invoke(
    {
      messages: [{ role: "user", content: input }],
    },
    {
      configurable: { thread_id: "user123" }, //kuxh bhe thread id likh skty ho.
    },
  );
  res
    .status(200)
    .json({ ai: response.messages[response.messages.length - 1].content });
});

//without langchain CHATBOT
// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// app.post("/chat", async (req, res) => {
//   const { input } = req.body;
//   const interaction = await ai.interactions.create({
//     model: "gemini-3.5-flash",
//     input,
//   });
//   res.status(200).json({ output_text: interaction.output_text });
// });

app.get("/", (req, res) => {
  res.status(200).json({ message: "helo from server" });
});

app.listen(port, () => {
  console.log(`Server is Listen on ${port}`);
});
