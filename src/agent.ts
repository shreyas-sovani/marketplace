import 'dotenv/config';
import { privateKeyToAccount } from 'viem/accounts';
import { toClientEvmSigner, ExactEvmScheme } from '@x402/evm';
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, ToolMessage, AIMessage, type BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { getVendorById, getVendorSummary } from './vendors.js';

// =============================================================================
// TYPES
// =============================================================================

export interface SessionState {
  sessionId: string;
  budget: number;
  spent: number;
  transactions: TransactionRecord[];
  logs: LogEntry[];
  status: 'idle' | 'thinking' | 'purchasing' | 'complete' | 'error';
  /** Cached marketplace products for this session */
  marketplaceCache: MarketplaceProduct[] | null;
}

export interface TransactionRecord {
  vendorId: string;
  vendorName: string;
  amount: number;
  txHash: string;
  timestamp: string;
  justification: string;
  source: 'legacy_vendor' | 'marketplace';
}

export interface LogEntry {
  step: 'ANALYSIS' | 'BUDGET' | 'DECISION' | 'REJECTION' | 'PURCHASE' | 'FINAL' | 'BROWSE';
  thought: string;
  status: 'Thinking' | 'Approved' | 'Rejected' | 'Complete';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/** Marketplace product from /api/market/products */
export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'human_alpha' | 'api';
  sellerName?: string;
  sellerWallet: string;
  salesCount: number;
}

export interface SSELogEvent { type: 'log'; data: LogEntry; }
export interface SSETransactionEvent { type: 'tx'; data: { amount: number; vendor: string; vendorId: string; txHash: string; budgetRemaining: number; source: string; }; }
export interface SSEAnswerEvent { type: 'answer'; data: { content: string; complete: boolean; }; }
export interface SSEErrorEvent { type: 'error'; data: { message: string; code: string; }; }
export interface SSEBudgetEvent { type: 'budget'; data: { total: number; spent: number; remaining: number; }; }
export type SSEEvent = SSELogEvent | SSETransactionEvent | SSEAnswerEvent | SSEErrorEvent | SSEBudgetEvent;

// =============================================================================
// CONFIG
// =============================================================================

export const CONFIG = {
  SERVER_URL: 'http://localhost:4021',
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.2,
  MAX_LLM_CALLS: 10,
  MIN_DELAY_BETWEEN_CALLS_MS: 800,
  INITIAL_BUDGET_USD: 0.10,
  NETWORK: 'eip155:84532' as const,
} as const;

// =============================================================================
// SYSTEM PROMPT - INFOMART HUNTER PERSONA
// =============================================================================

export function getInfoMartSystemPrompt(marketplaceProducts: MarketplaceProduct[]): string {
  // Format marketplace products for the prompt
  const marketplaceSection = marketplaceProducts.length > 0
    ? marketplaceProducts.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: `$${p.price.toFixed(2)}`,
        type: p.type,
        seller: p.sellerName || 'Anonymous',
        sales: p.salesCount,
      }))
    : [];

  return `You are **InfoMart Agent**, an elite intelligence hunter with a ruthless financial discipline. You operate the InfoMart P2P Knowledge Marketplace where humans sell insights and you buy them with real USDC.

## YOUR IDENTITY
- You are a **Hunter for Human Alpha** — unique insights from real humans
- You have a **Miser's discipline** — every cent must deliver ROI
- You prefer **human_alpha** products over generic API data
- You stream your reasoning transparently to build trust

## YOUR BUDGET
You have exactly **$0.10 USDC**. This is REAL cryptocurrency. Every purchase is recorded on-chain.

## AVAILABLE DATA SOURCES

### 🧠 INFOMART MARKETPLACE (Human Alpha - PREFERRED)
${JSON.stringify(marketplaceSection, null, 2)}

### 🤖 LEGACY VENDORS (API Data)
${JSON.stringify(getVendorSummary(), null, 2)}

## YOUR TOOLS

### 1. log_reasoning
Stream your internal monologue. MUST call before any decision.
- step: "ANALYSIS" | "BUDGET" | "DECISION" | "REJECTION" | "BROWSE"
- thought: Your reasoning (be specific about costs, value, and source preference)
- status: "Thinking" | "Approved" | "Rejected"

### 2. browse_marketplace
Refresh the list of available marketplace products. Use if you need updated listings.
Returns: Array of products with id, title, description, price, type, seller

### 3. purchase_data
Buy data from marketplace OR legacy vendor. ONLY after log_reasoning with status="Approved".
- product_id: The product/vendor ID to purchase
- source: "marketplace" or "legacy_vendor"
- justification: Why this data is worth the cost

## CRITICAL RULES

### 🎯 THE HUMAN ALPHA PREFERENCE
When the query involves:
- Subjective insights (strategies, opinions, predictions)
- Niche expertise (tax loopholes, winning formulas, insider tips)
- Time-sensitive intelligence (sentiment, breaking analysis)

**PREFER products with type="human_alpha"** over legacy API vendors.
Human knowledge often has higher signal-to-noise ratio.

### 🚫 THE TAYLOR SWIFT DEFENSE
If the query could be answered by:
- Basic arithmetic ("What is 2+2?")
- Common knowledge ("Who is Taylor Swift?")
- Simple facts ("Capital of France?")

You MUST:
1. log_reasoning with step="REJECTION", status="Rejected"
2. thought="General knowledge. Zero ROI. No data source adds value."
3. DO NOT purchase anything
4. Answer from your own knowledge

### 💰 THE MISER'S AUDIT
Before EVERY purchase:
1. log_reasoning(ANALYSIS): "What unique value does the user need?"
2. log_reasoning(BUDGET): "Cost: $X. Budget remaining: $Y. ROI assessment..."
3. log_reasoning(DECISION): "Approved/Rejected because..."

### 📊 SOURCE SELECTION LOGIC
| Query Type | Preferred Source | Reason |
|------------|------------------|--------|
| Strategies, tips, insider knowledge | marketplace (human_alpha) | Unique human insights |
| Breaking news, market data | legacy_vendor (bloomberg) | Real-time API feeds |
| Regulatory/legal questions | BOTH | Cross-reference human + official |
| Generic facts | NONE | Use own knowledge |

## WORKFLOW
1. Receive query
2. log_reasoning(ANALYSIS): Classify query type and identify data needs
3. If generic → log_reasoning(REJECTION) → Answer directly → STOP
4. If specialized:
   a. Check marketplace for human_alpha products matching the topic
   b. Check legacy vendors if API data is also useful
   c. log_reasoning(BUDGET): Calculate total cost vs. value
   d. log_reasoning(DECISION): Approve/reject each source
5. purchase_data for each approved source
6. Synthesize ALL purchased data into comprehensive answer
7. Cite your sources (marketplace seller names, vendor names)

## REMEMBER
- You are spending REAL money on behalf of the user
- Human Alpha is often worth more than its price suggests
- Always justify purchases with specific reasoning
- Stream your thoughts — transparency builds trust

BE A RUTHLESS HUNTER. FIND THE ALPHA. GUARD THE BUDGET.`;
}

// Legacy prompt for backwards compatibility
export function getDueDiligenceSystemPrompt(): string {
  return getInfoMartSystemPrompt([]);
}

// =============================================================================
// WALLET SETUP
// =============================================================================

export function setupWallet() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error('AGENT_PRIVATE_KEY not found in .env file');
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const signer = toClientEvmSigner(account);
  const client = new x402Client().register(CONFIG.NETWORK, new ExactEvmScheme(signer));
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  return { account, fetchWithPayment, address: account.address };
}

// =============================================================================
// TOOL: LOG REASONING
// =============================================================================

export function createLogReasoningTool(emitSSE: (event: SSEEvent) => void) {
  return tool(
    async ({ step, thought, status }: { step: 'ANALYSIS' | 'BUDGET' | 'DECISION' | 'REJECTION' | 'BROWSE'; thought: string; status: 'Thinking' | 'Approved' | 'Rejected'; }) => {
      const logEntry: LogEntry = { step, thought, status, timestamp: new Date().toISOString() };
      emitSSE({ type: 'log', data: logEntry });
      console.log(`   [${step}] ${status}: ${thought.slice(0, 80)}...`);
      return JSON.stringify({ logged: true, step, status, message: `Reasoning logged: ${step} - ${status}` });
    },
    {
      name: 'log_reasoning',
      description: 'Log your reasoning process. MUST be called before any purchase decision.',
      schema: z.object({
        step: z.enum(['ANALYSIS', 'BUDGET', 'DECISION', 'REJECTION', 'BROWSE']).describe('The reasoning phase'),
        thought: z.string().describe('Your detailed reasoning about costs, value, and ROI'),
        status: z.enum(['Thinking', 'Approved', 'Rejected']).describe('Current status'),
      }),
    }
  );
}

// =============================================================================
// TOOL: BROWSE MARKETPLACE (NEW)
// =============================================================================

export function createBrowseMarketplaceTool(session: SessionState, emitSSE: (event: SSEEvent) => void) {
  return tool(
    async () => {
      console.log(`   Browsing InfoMart marketplace...`);
      
      try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/market/products`);
        if (!response.ok) {
          throw new Error(`Marketplace request failed: ${response.status}`);
        }
        
        const data = await response.json() as { products?: MarketplaceProduct[] };
        const products: MarketplaceProduct[] = data.products || [];
        
        // Cache products in session for agent's future reference
        session.marketplaceCache = products;
        
        const logEntry: LogEntry = {
          step: 'BROWSE',
          thought: `Found ${products.length} products in marketplace`,
          status: 'Thinking',
          timestamp: new Date().toISOString(),
          metadata: { productCount: products.length },
        };
        emitSSE({ type: 'log', data: logEntry });
        
        console.log(`   Found ${products.length} marketplace products`);
        
        return JSON.stringify({
          success: true,
          count: products.length,
          products: products.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: `$${p.price.toFixed(2)}`,
            type: p.type,
            seller: p.sellerName || 'Anonymous',
            sales: p.salesCount,
          })),
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`   Marketplace browse failed: ${errorMsg}`);
        emitSSE({ type: 'error', data: { message: `Marketplace unavailable: ${errorMsg}`, code: 'MARKETPLACE_ERROR' } });
        return JSON.stringify({ success: false, error: errorMsg, products: [] });
      }
    },
    {
      name: 'browse_marketplace',
      description: 'Browse the InfoMart marketplace to see available human alpha products. Returns list of products with IDs, titles, prices, and types.',
      schema: z.object({}),
    }
  );
}

// =============================================================================
// TOOL: PURCHASE DATA (UPGRADED)
// =============================================================================

export function createPurchaseDataTool(fetchWithPayment: typeof fetch, session: SessionState, emitSSE: (event: SSEEvent) => void) {
  return tool(
    async ({ product_id, source, justification }: { product_id: string; source: 'marketplace' | 'legacy_vendor'; justification: string }) => {
      
      // =====================================================================
      // ROUTE 1: MARKETPLACE PURCHASE (Human Alpha)
      // =====================================================================
      if (source === 'marketplace') {
        // Find product in cache or fetch fresh
        let product: MarketplaceProduct | undefined;
        
        if (session.marketplaceCache) {
          product = session.marketplaceCache.find(p => p.id === product_id);
        }
        
        if (!product) {
          // Try to fetch the product directly
          try {
            const listResp = await fetch(`${CONFIG.SERVER_URL}/api/market/products`);
            const listData = await listResp.json() as { products?: MarketplaceProduct[] };
            session.marketplaceCache = listData.products || [];
            product = session.marketplaceCache?.find(p => p.id === product_id);
          } catch {
            // Ignore fetch errors
          }
        }
        
        if (!product) {
          emitSSE({ type: 'error', data: { message: `Unknown marketplace product: ${product_id}`, code: 'PRODUCT_NOT_FOUND' } });
          return JSON.stringify({ success: false, error: `Unknown marketplace product: ${product_id}` });
        }
        
        const remaining = session.budget - session.spent;
        if (product.price > remaining) {
          emitSSE({ type: 'error', data: { message: `Insufficient budget. Need $${product.price.toFixed(2)}, have $${remaining.toFixed(2)}`, code: 'INSUFFICIENT_BUDGET' } });
          return JSON.stringify({ success: false, error: `Insufficient budget for ${product.title}` });
        }
        
        console.log(`   Purchasing from marketplace: "${product.title}" ($${product.price.toFixed(2)})...`);
        session.status = 'purchasing';
        
        try {
          // x402 paywall endpoint
          const fullUrl = `${CONFIG.SERVER_URL}/api/market/product/${product_id}/buy`;
          const response = await fetchWithPayment(fullUrl);
          
          if (!response.ok) {
            throw new Error(`Marketplace purchase failed: ${response.status}`);
          }
          
          const purchasedData = await response.json();
          
          // Extract transaction hash from x402 payment response
          let txHash = 'sim-' + Math.random().toString(36).slice(2, 10);
          const paymentResponse = response.headers.get('PAYMENT-RESPONSE');
          if (paymentResponse) {
            try {
              const decoded = JSON.parse(Buffer.from(paymentResponse, 'base64').toString('utf-8'));
              txHash = decoded.transaction || txHash;
            } catch { /* use sim hash */ }
          }
          
          session.spent += product.price;
          session.transactions.push({
            vendorId: product_id,
            vendorName: product.title,
            amount: product.price,
            txHash,
            timestamp: new Date().toISOString(),
            justification,
            source: 'marketplace',
          });
          
          emitSSE({ type: 'tx', data: { amount: product.price, vendor: product.title, vendorId: product_id, txHash, budgetRemaining: session.budget - session.spent, source: 'marketplace' } });
          emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
          
          console.log(`   Purchased from marketplace! TX: ${txHash.slice(0, 16)}...`);
          
          return JSON.stringify({
            success: true,
            source: 'marketplace',
            product: product.title,
            seller: product.sellerName || 'Anonymous',
            type: product.type,
            cost: product.price,
            txHash,
            budgetRemaining: session.budget - session.spent,
            data: purchasedData,
          });
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.log(`   Marketplace purchase failed: ${errorMsg}`);
          emitSSE({ type: 'error', data: { message: `Purchase failed: ${errorMsg}`, code: 'PURCHASE_FAILED' } });
          return JSON.stringify({ success: false, error: errorMsg });
        }
      }
      
      // =====================================================================
      // ROUTE 2: LEGACY VENDOR PURCHASE (API Data)
      // =====================================================================
      const vendor = getVendorById(product_id);
      if (!vendor) {
        emitSSE({ type: 'error', data: { message: `Unknown vendor: ${product_id}`, code: 'VENDOR_NOT_FOUND' } });
        return JSON.stringify({ success: false, error: `Unknown vendor: ${product_id}` });
      }
      
      const remaining = session.budget - session.spent;
      if (vendor.cost > remaining) {
        emitSSE({ type: 'error', data: { message: `Insufficient budget. Need $${vendor.cost.toFixed(2)}, have $${remaining.toFixed(2)}`, code: 'INSUFFICIENT_BUDGET' } });
        return JSON.stringify({ success: false, error: `Insufficient budget` });
      }
      
      console.log(`   Purchasing from legacy vendor: ${vendor.name} ($${vendor.cost.toFixed(2)})...`);
      session.status = 'purchasing';
      
      try {
        const fullUrl = `${CONFIG.SERVER_URL}/api/vendor/${product_id}`;
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
        session.transactions.push({ vendorId: product_id, vendorName: vendor.name, amount: vendor.cost, txHash, timestamp: new Date().toISOString(), justification, source: 'legacy_vendor' });
        emitSSE({ type: 'tx', data: { amount: vendor.cost, vendor: vendor.name, vendorId: product_id, txHash, budgetRemaining: session.budget - session.spent, source: 'legacy_vendor' } });
        emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
        
        console.log(`   Purchased from legacy vendor! TX: ${txHash.slice(0, 16)}...`);
        return JSON.stringify({ success: true, source: 'legacy_vendor', vendor: vendor.name, cost: vendor.cost, txHash, budgetRemaining: session.budget - session.spent, data: vendorData });
      } catch (error) {
        console.log(`   Legacy purchase failed, using simulated data...`);
        session.spent += vendor.cost;
        const txHash = 'sim-' + Math.random().toString(36).slice(2, 10);
        session.transactions.push({ vendorId: product_id, vendorName: vendor.name, amount: vendor.cost, txHash, timestamp: new Date().toISOString(), justification, source: 'legacy_vendor' });
        emitSSE({ type: 'tx', data: { amount: vendor.cost, vendor: vendor.name, vendorId: product_id, txHash, budgetRemaining: session.budget - session.spent, source: 'legacy_vendor' } });
        emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
        return JSON.stringify({ success: true, source: 'legacy_vendor', vendor: vendor.name, cost: vendor.cost, txHash, budgetRemaining: session.budget - session.spent, data: vendor.data, note: 'Used simulated data' });
      }
    },
    {
      name: 'purchase_data',
      description: 'Purchase data from InfoMart marketplace OR legacy vendor using x402 payment. ONLY call after log_reasoning with status="Approved".',
      schema: z.object({
        product_id: z.string().describe('The product/vendor ID to purchase from'),
        source: z.enum(['marketplace', 'legacy_vendor']).describe('Source: "marketplace" for human alpha products, "legacy_vendor" for API data'),
        justification: z.string().describe('Why this data is worth the cost'),
      }),
    }
  );
}

// =============================================================================
// SESSION FACTORY
// =============================================================================

export function createSession(sessionId: string): SessionState {
  return { sessionId, budget: CONFIG.INITIAL_BUDGET_USD, spent: 0, transactions: [], logs: [], status: 'idle', marketplaceCache: null };
}

// Agent Result
export interface AgentResult { answer: string; session: SessionState; }

// =============================================================================
// MAIN AGENT FUNCTION - INFOMART HUNTER
// =============================================================================

export async function runDueDiligenceAgent(query: string, sessionId: string, emitSSE: (event: SSEEvent) => void): Promise<AgentResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`INFOMART AGENT - Session: ${sessionId}`);
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
  
  // Fetch initial marketplace products for system prompt
  let initialProducts: MarketplaceProduct[] = [];
  try {
    console.log(`   Fetching marketplace products...`);
    const marketResp = await fetch(`${CONFIG.SERVER_URL}/api/market/products`);
    if (marketResp.ok) {
      const marketData = await marketResp.json() as { products?: MarketplaceProduct[] };
      initialProducts = marketData.products || [];
      session.marketplaceCache = initialProducts;
      console.log(`   Found ${initialProducts.length} marketplace products`);
    }
  } catch (e) {
    console.log(`   Marketplace unavailable, continuing with legacy vendors only`);
  }
  
  const llm = new ChatGoogleGenerativeAI({ model: CONFIG.MODEL, temperature: CONFIG.TEMPERATURE, maxRetries: 2 });
  const tools = [
    createLogReasoningTool((event) => { emitSSE(event); if (event.type === 'log') session.logs.push(event.data); }),
    createBrowseMarketplaceTool(session, emitSSE),
    createPurchaseDataTool(fetchWithPayment, session, emitSSE),
  ];
  const llmWithTools = llm.bindTools(tools);
  
  // Use InfoMart prompt with marketplace products
  const systemPrompt = getInfoMartSystemPrompt(initialProducts);
  const messages: BaseMessage[] = [new SystemMessage(systemPrompt), new HumanMessage(query)];
  
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
  console.log(`InfoMart Session Complete - Spent: $${session.spent.toFixed(2)} / $${session.budget.toFixed(2)}`);
  console.log(`${'='.repeat(60)}\n`);
  
  return { answer: finalAnswer, session };
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

async function main() {
  const query = process.argv[2] || "What strategies do Indian traders use to minimize crypto taxes?";
  console.log('\nRunning InfoMart Agent in CLI mode...\n');
  const result = await runDueDiligenceAgent(query, 'cli-' + Date.now(), (event) => {
    if (event.type === 'log') console.log(`[LOG] ${event.data.step}: ${event.data.thought}`);
    else if (event.type === 'tx') console.log(`[TX] ${event.data.vendor}: -$${event.data.amount.toFixed(2)} (${event.data.source})`);
  });
  console.log('\nFINAL ANSWER:\n' + '-'.repeat(60) + '\n' + result.answer + '\n' + '-'.repeat(60));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
