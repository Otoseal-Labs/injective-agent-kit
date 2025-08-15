import { InjectiveEVMAgentKit } from "../src";
import { createInjectiveTools } from "../src/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { ModelProvider } from "../src/types";

dotenv.config();

function checkRequiredEnvVars(): void {
  const missingVars: string[] = [];
  const requiredVars = ["COHERE_API_KEY", "PRIVATE_KEY", "RPC_URL"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

async function setupAgent() {
  try {
    checkRequiredEnvVars();
    
    // const llm = new ChatOpenAI({
    //   model: "gpt-4o",
    //   temperature: 0,
    // });

    const llm = new ChatCohere({
      model: "command-r-plus",
      temperature: 0,
    });

    // const llm = new ChatMistralAI({
    //   model: "magistral-small-2507",
    //   temperature: 0,
    // });

    const agentInstance = new InjectiveEVMAgentKit(
      process.env.PRIVATE_KEY!,
      ModelProvider.COHERE,
    );
    const agentTools = createInjectiveTools(agentInstance);

    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "Injective Agent Kit!" } };

    const agent = createReactAgent({
      llm,
      tools: agentTools,
      checkpointSaver: memory,
      messageModifier: `
        You are a lively and witty agent, designed to interact onchain using the Injective Agent Kit. 
        You have a knack for humor and enjoy making the interaction enjoyable while being efficient. 
        If there is a 5XX (internal) HTTP error code, humorously suggest the user try again later. 
        All users' wallet infos are already provided on the tool kit. If someone asks you to do something you
        can't do with your currently available tools, respond with a playful apology and encourage them to implement it
        themselves using the Injective Agent Kit repository that they can find on https://github.com/Otoseal-Labs/injective-agent-kit. Suggest they visit the Twitter account https://x.com/otoseal for more information, perhaps with a light-hearted comment about the wonders of the internet. Be concise, helpful, and sprinkle in some humor with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        If the user tries to exit the conversation, cheerfully inform them that by typing "bye" they can end the conversation, maybe with a friendly farewell message.
      `,
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function startInteractiveSession(agent: any, config: any) {
  console.log("\nStarting chat with the Injective Agent... Type 'bye' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nYou: ");

      if (userInput.toLowerCase() === "bye") {
        break;
      }

      const responseStream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
        config,
      );

      for await (const responseChunk of responseStream) {
        if ("agent" in responseChunk) {
          console.log("\nInjective Agent:", responseChunk.agent.messages[0].content);
        } else if ("tools" in responseChunk) {
          console.log("\nInjective Agent:", responseChunk.tools.messages[0].content);
        }
        console.log("\n-----------------------------------\n");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function main() {
  try {
    console.log('\x1b[38;2;201;235;52m%s\x1b[0m', `                                                                              
_|_|_|            _|                        _|      _|                        
  _|    _|_|_|          _|_|      _|_|_|  _|_|_|_|      _|      _|    _|_|    
  _|    _|    _|  _|  _|_|_|_|  _|          _|      _|  _|      _|  _|_|_|_|  
  _|    _|    _|  _|  _|        _|          _|      _|    _|  _|    _|        
_|_|_|  _|    _|  _|    _|_|_|    _|_|_|      _|_|  _|      _|        _|_|_|  
                  _|                                                          
                _|                                                            
                                                                              
  _|_|                                    _|          _|    _|  _|    _|      
_|    _|    _|_|_|    _|_|    _|_|_|    _|_|_|_|      _|  _|        _|_|_|_|  
_|_|_|_|  _|    _|  _|_|_|_|  _|    _|    _|          _|_|      _|    _|      
_|    _|  _|    _|  _|        _|    _|    _|          _|  _|    _|    _|      
_|    _|    _|_|_|    _|_|_|  _|    _|      _|_|      _|    _|  _|      _|_|  
                _|                                                            
            _|_|   
`);
    const { agent, config } = await setupAgent();
    await startInteractiveSession(agent, config);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

export { setupAgent, startInteractiveSession };

main();
