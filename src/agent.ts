import 'dotenv/config';
import { privateKeyToAccount } from 'viem/accounts';
import { toClientEvmSigner, ExactEvmScheme } from '@x402/evm';
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, ToolMessage, AIMessage, type BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { getVendorById, getVendorSummary } from './vendors.js';

// Types
export interface SessionState {
  sessionId: string;
  budget: number;
  spent: number;
  transactions: TransactionRecord[];
  logs: LogEntry[];
  status: 'idle' | 'thinking' | 'purchasing' | 'complete' | 'error';
}

export interface TransactionRecord {
  vendorId: string;
  vendorName: string;
  amount: number;
  txHash: string;
  timestamp: string;
  justification: string;
}

export interface LogEntry {
  step: 'ANALYSIS' | 'BUDGET' | 'DECISION' | 'REJECTION' | 'PURCHASE' | 'FINAL';
  thought: string;
  status: 'Thinking' | 'Approved' | 'Rejected' | 'Complete';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SSELogEvent { type: 'log'; data: LogEntry; }
export interface SSETransactionEvent { type: 'tx'; data: { amount: number; vendor: string; vendorId: string; txHash: string; budgetRemaining: number; }; }
export interface SSEAnswerEvent { type: 'answer'; data: { content: string; complete: boolean; }; }
export interface SSEErrorEvent { type: 'error'; data: { message: string; code: string; }; }
export interface SSEBudgetEvent { type: 'budget'; data: { total: number; spent: number; remaining: number; }; }
export type SSEEvent = SSELogEvent | SSETransactionEvent | SSEAnswerEvent | SSEErrorEvent | SSEBudgetEvent;

// Config
export const CONFIG = {
  SERVER_URL: 'http://localhost:4021',
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.2,
  MAX_LLM_CALLS: 10,
  MIN_DELAY_BETWEEN_CALLS_MS: 800,
  INITIAL_BUDGET_USD: 0.10,
  NETWORK: 'eip155:84532' as const,
} as const;

// System Prompt
export function getDueDiligenceSystemPrompt(): string {
  return `You are **DueDiligence**, a ruthless financial controller AI. Your job is to maximize ROI on every data purchase.

## YOUR BUDGET
You have exactly $0.10 USDC. Every cent counts. You MUST justify every purchase.

## AVAILABLE VENDORS
${JSON.stringify(getVendorSummary(), null, 2)}

## YOUR TOOLS

### 1. log_reasoning
Call this BEFORE any decision. Stream your internal monologue to the user.
- step: "ANALYSIS" | "BUDGET" | "DECISION" | "REJECTION"
- thought: Your reasoning (be specific about costs and value)
- status: "Thinking" | "Approved" | "Rejected"

### 2. purchase_data
Buy data from a vendor. ONLY call this after log_reasoning with status="Approved".
- vendor_id: The vendor to purchase from
- justification: Why this data is worth the cost

## CRITICAL CONSTRAINTS

### THE TAYLOR SWIFT DEFENSE
If the user asks a generic question that could be answered by:
- Basic arithmetic (e.g., "What is 2+2?")
- Common knowledge (e.g., "Who is Taylor Swift?", "What is the capital of France?")
- Simple facts available in any search engine

You MUST:
1. Call log_reasoning with step="REJECTION", status="Rejected"
2. thought="General knowledge query. Zero ROI. No vendor provides unique value for this."
3. DO NOT purchase ANY data
4. Provide the answer from your own knowledge

### THE AUDIT RULE
You MUST call log_reasoning with step="ANALYSIS" BEFORE considering any purchase.
You MUST call log_reasoning with step="BUDGET" to show cost calculation.
You MUST call log_reasoning with step="DECISION" with your final buy/no-buy choice.

### THE BUDGET RULE
- Never exceed $0.10 total spending
- Always check remaining budget before purchasing
- Prefer cheaper vendors if they provide equivalent value
- wiki_basic and weather_global are usually LOW VALUE traps - avoid unless specifically needed

## WORKFLOW
1. Receive user query
2. log_reasoning(ANALYSIS): "What unique intelligence does the user need?"
3. If generic query -> log_reasoning(REJECTION) -> Answer from own knowledge -> STOP
4. log_reasoning(BUDGET): "Calculating cost vs. value for relevant vendors..."
5. log_reasoning(DECISION): "Approving/Rejecting vendor X because..."
6. If approved -> purchase_data for each approved vendor
7. Synthesize all purchased data into comprehensive answer

BE RUTHLESS. EVERY CENT COUNTS. REJECT WASTEFUL QUERIES.`;
}

// Wallet Setup
export function setupWallet() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error('AGENT_PRIVATE_KEY not found in .env file');
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const signer = toClientEvmSigner(account);
  const client = new x402Client().register(CONFIG.NETWORK, new ExactEvmScheme(signer));
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  return { account, fetchWithPayment, address: account.address };
}

// Tool: Log Reasoning
export function createLogReasoningTool(emitSSE: (event: SSEEvent) => void) {
  return tool(
    async ({ step, thought, status }: { step: 'ANALYSIS' | 'BUDGET' | 'DECISION' | 'REJECTION'; thought: string; status: 'Thinking' | 'Approved' | 'Rejected'; }) => {
      const logEntry: LogEntry = { step, thought, status, timestamp: new Date().toISOString() };
      emitSSE({ type: 'log', data: logEntry });
      console.log(`   [${step}] ${status}: ${thought.slice(0, 80)}...`);
      return JSON.stringify({ logged: true, step, status, message: `Reasoning logged: ${step} - ${status}` });
    },
    {
      name: 'log_reasoning',
      description: 'Log your reasoning process. MUST be called before any purchase decision.',
      schema: z.object({
        step: z.enum(['ANALYSIS', 'BUDGET', 'DECISION', 'REJECTION']).describe('The reasoning phase'),
        thought: z.string().describe('Your detailed reasoning about costs, value, and ROI'),
        status: z.enum(['Thinking', 'Approved', 'Rejected']).describe('Current status'),
      }),
    }
  );
}

// Tool: Purchase Data
export function createPurchaseDataTool(fetchWithPayment: typeof fetch, session: SessionState, emitSSE: (event: SSEEvent) => void) {
  return tool(
    async ({ vendor_id, justification }: { vendor_id: string; justification: string }) => {
      const vendor = getVendorById(vendor_id);
      if (!vendor) {
        emitSSE({ type: 'error', data: { message: `Unknown vendor: ${vendor_id}`, code: 'VENDOR_NOT_FOUND' } });
        return JSON.stringify({ success: false, error: `Unknown vendor: ${vendor_id}` });
      }
      
      const remaining = session.budget - session.spent;
      if (vendor.cost > remaining) {
        emitSSE({ type: 'error', data: { message: `Insufficient budget. Need $${vendor.cost.toFixed(2)}, have $${remaining.toFixed(2)}`, code: 'INSUFFICIENT_BUDGET' } });
        return JSON.stringify({ success: false, error: `Insufficient budget` });
      }
      
      console.log(`   Purchasing from ${vendor.name} ($${vendor.cost.toFixed(2)})...`);
      session.status = 'purchasing';
      
      try {
        const fullUrl = `${CONFIG.SERVER_URL}/api/vendor/${vendor_id}`;
        const response = await fetchWithPayment(fullUrl);
        if (!response.ok) throw new Error(`Vendor request failed: ${response.status}`);
        const vendorData = await response.json();
        
        let txHash = 'sim-' + Math.random().toString(36).slice(2, 10);
        const paymentResponse = response.headers.get('PAYMENT-RESPONSE');
        if (paymentResponse) {
          try {
            const decoded = JSON.parse(Buffer.from(paymentResponse, 'base64').toString('utf-8'));
            txHash = decoded.transaction || txHash;
          } catch { /* use sim hash */ }
        }
        
        session.spent += vendor.cost;
        session.transactions.push({ vendorId: vendor_id, vendorName: vendor.name, amount: vendor.cost, txHash, timestamp: new Date().toISOString(), justification });
        emitSSE({ type: 'tx', data: { amount: vendor.cost, vendor: vendor.name, vendorId: vendor_id, txHash, budgetRemaining: session.budget - session.spent } });
        emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
        
        console.log(`   Purchased! TX: ${txHash.slice(0, 16)}...`);
        return JSON.stringify({ success: true, vendor: vendor.name, cost: vendor.cost, txHash, budgetRemaining: session.budget - session.spent, data: vendorData });
      } catch (error) {
        console.log(`   Purchase failed, using simulated data...`);
        session.spent += vendor.cost;
        const txHash = 'sim-' + Math.random().toString(36).slice(2, 10);
        session.transactions.push({ vendorId: vendor_id, vendorName: vendor.name, amount: vendor.cost, txHash, timestamp: new Date().toISOString(), justification });
        emitSSE({ type: 'tx', data: { amount: vendor.cost, vendor: vendor.name, vendorId: vendor_id, txHash, budgetRemaining: session.budget - session.spent } });
        emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
        return JSON.stringify({ success: true, vendor: vendor.name, cost: vendor.cost, txHash, budgetRemaining: session.budget - session.spent, data: vendor.data, note: 'Used simulated data' });
      }
    },
    {
      name: 'purchase_data',
      description: 'Purchase data from a vendor using x402 payment. ONLY call after log_reasoning with status="Approved".',
      schema: z.object({
        vendor_id: z.string().describe('The vendor ID (e.g., "legal_in", "bloomberg_lite")'),
        justification: z.string().describe('Why this data is worth the cost'),
      }),
    }
  );
}

// Session Factory
export function createSession(sessionId: string): SessionState {
  return { sessionId, budget: CONFIG.INITIAL_BUDGET_USD, spent: 0, transactions: [], logs: [], status: 'idle' };
}

// Agent Result
export interface AgentResult { answer: string; session: SessionState; }

// Main Agent Function
export async function runDueDiligenceAgent(query: string, sessionId: string, emitSSE: (event: SSEEvent) => void): Promise<AgentResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`DUEDILIGENCE AGENT - Session: ${sessionId}`);
  console.log(`Query: "${query}"`);
  console.log(`Budget: $${CONFIG.INITIAL_BUDGET_USD.toFixed(2)}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const session: SessionState = createSession(sessionId);
  session.status = 'thinking';
  emitSSE({ type: 'budget', data: { total: session.budget, spent: 0, remaining: session.budget } });
  
  let fetchWithPayment: typeof fetch;
  try {
    const wallet = setupWallet();
    fetchWithPayment = wallet.fetchWithPayment;
    console.log(`Wallet: ${wallet.address}`);
  } catch {
    console.log(`Wallet not configured, using simulation mode`);
    fetchWithPayment = fetch;
  }
  
  const geminiKey = process.env.GOOGLE_API_KEY;
  if (!geminiKey || geminiKey === 'your-google-api-key-here') {
    emitSSE({ type: 'error', data: { message: 'GOOGLE_API_KEY not configured', code: 'NO_API_KEY' } });
    throw new Error('GOOGLE_API_KEY not found in .env file');
  }
  
  const llm = new ChatGoogleGenerativeAI({ model: CONFIG.MODEL, temperature: CONFIG.TEMPERATURE, maxRetries: 2 });
  const tools = [
    createLogReasoningTool((event) => { emitSSE(event); if (event.type === 'log') session.logs.push(event.data); }),
    createPurchaseDataTool(fetchWithPayment, session, emitSSE),
  ];
  const llmWithTools = llm.bindTools(tools);
  const messages: BaseMessage[] = [new SystemMessage(getDueDiligenceSystemPrompt()), new HumanMessage(query)];
  
  let iterations = 0;
  const MAX_ITERATIONS = 8;
  let finalAnswer = '';
  
  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++;
      console.log(`\n--- Iteration ${iterations} ---`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.MIN_DELAY_BETWEEN_CALLS_MS));
      
      const response = await llmWithTools.invoke(messages) as AIMessage;
      messages.push(response);
      
      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const toolCall of response.tool_calls) {
          console.log(`   Tool: ${toolCall.name}`);
          const toolDef = tools.find(t => t.name === toolCall.name);
          if (toolDef) {
            const result = await (toolDef as any).invoke(toolCall.args as Record<string, unknown>);
            messages.push(new ToolMessage({ tool_call_id: toolCall.id!, content: typeof result === 'string' ? result : JSON.stringify(result) }));
          }
        }
      } else {
        finalAnswer = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        console.log(`\nFinal Answer Generated`);
        break;
      }
    }
    if (iterations >= MAX_ITERATIONS) finalAnswer = 'Maximum iterations reached.';
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Agent error: ${errorMsg}`);
    emitSSE({ type: 'error', data: { message: errorMsg, code: 'AGENT_ERROR' } });
    finalAnswer = `Error: ${errorMsg}`;
  }
  
  session.status = 'complete';
  emitSSE({ type: 'answer', data: { content: finalAnswer, complete: true } });
  emitSSE({ type: 'log', data: { step: 'FINAL', thought: `Session complete. Spent $${session.spent.toFixed(2)} of $${session.budget.toFixed(2)} budget. ${session.transactions.length} purchases made.`, status: 'Complete', timestamp: new Date().toISOString() } });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Session Complete - Spent: $${session.spent.toFixed(2)} / $${session.budget.toFixed(2)}`);
  console.log(`${'='.repeat(60)}\n`);
  
  return { answer: finalAnswer, session };
}

// CLI Entry Point
async function main() {
  const query = process.argv[2] || "What are the crypto tax regulations in India?";
  console.log('\nRunning DueDiligence Agent in CLI mode...\n');
  const result = await runDueDiligenceAgent(query, 'cli-' + Date.now(), (event) => {
    if (event.type === 'log') console.log(`[LOG] ${event.data.step}: ${event.data.thought}`);
    else if (event.type === 'tx') console.log(`[TX] ${event.data.vendor}: -$${event.data.amount.toFixed(2)}`);
  });
  console.log('\nFINAL ANSWER:\n' + '-'.repeat(60) + '\n' + result.answer + '\n' + '-'.repeat(60));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
