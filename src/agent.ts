import 'dotenv/config';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client, wrapFetchWithPayment, x402HTTPClient } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
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
  // Available models with tool calling support:
  // - gemini-2.5-flash (best for tools)
  // - gemini-2.0-flash
  // NOTE: gemini-2.5-flash-lite does NOT support tool calling properly
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.2,
  MAX_LLM_CALLS: 30,
  MIN_DELAY_BETWEEN_CALLS_MS: 800,
  INITIAL_BUDGET_USD: 0.50,
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

  return `You are **InfoMart Agent**, an elite intelligence hunter. You operate the InfoMart P2P Knowledge Marketplace where humans sell insights and you buy them with real USDC.

## YOUR IDENTITY
- You are a **Hunter for Human Alpha** — unique insights from real humans
- You are **GENEROUS with purchases** — if data is relevant, BUY IT
- You prefer **human_alpha** products over generic API data
- You stream your reasoning transparently to build trust

## YOUR BUDGET
You have **$0.50 USDC**. This is REAL cryptocurrency. Every purchase is recorded on-chain.
**This is a generous budget — use it to get comprehensive information for the user!**

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

### 4. rate_product (MANDATORY AFTER PURCHASE)
IMMEDIATELY after purchase_data, you MUST evaluate the quality of the purchased data.
- productId: The product ID you just purchased
- rating: 1-5 integer score
- reason: Why you gave this rating

**RATING SCALE (affects seller's staked collateral):**
- Rating 1-2: SLASH $2.00 from seller stake (data is vague, generic, or unhelpful)
- Rating 3: SLASH $0.50 from seller stake (mediocre quality)
- Rating 4-5: REWARD +$0.05 to seller stake (high-value Human Alpha)

## CRITICAL RULES

### 🎯 BE GENEROUS WITH RELEVANT PURCHASES
**BUY ALL relevant products, not just one!** The user deserves comprehensive information.
- If multiple products are relevant to the query, purchase ALL of them
- Cross-reference multiple sources for better answers
- The budget is generous ($0.50) — use it wisely but don't be stingy
- Each product costs only $0.02-$0.10, so you can buy 5-10 products easily

### 🧠 THE HUMAN ALPHA PREFERENCE
When the query involves:
- Subjective insights (strategies, opinions, predictions)
- Niche expertise (tax loopholes, winning formulas, insider tips)
- Time-sensitive intelligence (sentiment, breaking analysis)

**PREFER products with type="human_alpha"** over legacy API vendors.

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

### 💰 PURCHASE MULTIPLE SOURCES
For specialized queries:
1. log_reasoning(ANALYSIS): "What unique value does the user need?"
2. browse_marketplace to see available products
3. **For EACH relevant product:**
   - log_reasoning(BUDGET): "Product X costs $Y. Budget: $Z. Relevant because..."
   - log_reasoning(DECISION): "Approved" with clear reason
   - purchase_data immediately
4. After ALL purchases → Synthesize into comprehensive answer

## WORKFLOW
1. Receive query
2. log_reasoning(ANALYSIS): Classify query type and identify data needs
3. If generic → log_reasoning(REJECTION) → Answer directly → STOP
4. If specialized:
   a. browse_marketplace to see available products
   b. **For EACH relevant product** (not just the first one!):
      - log_reasoning(BUDGET): Evaluate this specific product
      - log_reasoning(DECISION): "Approved" if relevant
      - purchase_data for this product
      - **IMMEDIATELY call rate_product** to evaluate the content quality
   c. Continue until all relevant products are purchased OR budget exhausted
5. Synthesize ALL purchased content into comprehensive answer
6. Cite your sources (marketplace seller names, vendor names)

## CRITICAL: ALWAYS RATE AFTER PURCHASE
After EVERY purchase_data call, you MUST call rate_product:
- If data is vague, generic, copy-paste, or unhelpful → rate 1-2 (SLASH)
- If data is mediocre, incomplete, or only partially useful → rate 3 (SLASH)
- If data is high-value, unique insights, actionable Human Alpha → rate 4-5 (REWARD)

This protects the marketplace from low-quality sellers!

## CRITICAL: BUY COMPREHENSIVELY
- If 2+ products are relevant, BUY ALL OF THEM
- Don't stop after one purchase — check for more relevant data
- Budget of $0.50 means you can buy 5-10 products
- More sources = better answer for the user
- After each purchase, evaluate if more products would help

## REMEMBER
- You are spending REAL money on behalf of the user
- The user WANTS comprehensive information — don't be stingy
- Human Alpha is often worth more than its price suggests
- Stream your thoughts — transparency builds trust
- NEVER return empty arrays or incomplete answers
- BUY EVERYTHING RELEVANT within budget

BE A GENEROUS HUNTER. FIND ALL THE ALPHA. USE THE BUDGET. COMPLETE ALL PURCHASES.`;
}

// Legacy prompt for backwards compatibility
export function getDueDiligenceSystemPrompt(): string {
  return getInfoMartSystemPrompt([]);
}

// =============================================================================
// WALLET SETUP - x402 v2 Client
// =============================================================================

export function setupWallet() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error('AGENT_PRIVATE_KEY not found in .env file');
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  // x402 v2: Create client and register EVM scheme with signer
  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });
  
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  
  console.log(`[x402 Client] Wallet initialized: ${account.address}`);
  console.log(`[x402 Client] Network: ${CONFIG.NETWORK}`);
  console.log(`[x402 Client] Payment scheme: exact (EVM)`);
  
  return { account, client, fetchWithPayment, address: account.address };
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
// TOOL: PURCHASE DATA - REAL x402 PAYMENTS (NO SIMULATION)
// =============================================================================

export function createPurchaseDataTool(fetchWithPayment: typeof fetch, session: SessionState, emitSSE: (event: SSEEvent) => void) {
  return tool(
    async ({ product_id, source, justification }: { product_id: string; source: 'marketplace' | 'legacy_vendor'; justification: string }) => {
      
      // =====================================================================
      // ROUTE 1: MARKETPLACE PURCHASE (Human Alpha) - REAL PAYMENT
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
        
        console.log(`   💸 REAL PURCHASE: "${product.title}" ($${product.price.toFixed(2)})...`);
        session.status = 'purchasing';
        
        // x402 paywall endpoint - REAL PAYMENT
        const fullUrl = `${CONFIG.SERVER_URL}/api/market/product/${product_id}/buy`;
        console.log(`   [x402] Calling: ${fullUrl}`);
        
        const response = await fetchWithPayment(fullUrl);
        
        console.log(`   [x402] Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          emitSSE({ type: 'error', data: { message: `Payment failed: ${response.status} - ${errorText}`, code: 'PAYMENT_FAILED' } });
          return JSON.stringify({ success: false, error: `Payment failed: ${response.status}` });
        }
        
        const purchasedData = await response.json();
        
        // Extract REAL transaction hash from x402 PAYMENT-RESPONSE header
        let txHash = 'unknown';
        const paymentResponseHeader = response.headers.get('PAYMENT-RESPONSE');
        console.log(`   [x402] PAYMENT-RESPONSE header: ${paymentResponseHeader ? 'present' : 'missing'}`);
        
        if (paymentResponseHeader) {
          try {
            const decoded = JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString('utf-8'));
            txHash = decoded.transaction || decoded.txHash || 'decoded-but-no-hash';
            console.log(`   [x402] ✅ REAL TX HASH: ${txHash}`);
            console.log(`   [x402] 🔗 Verify: https://sepolia.basescan.org/tx/${txHash}`);
          } catch (e) {
            console.log(`   [x402] ⚠️ Failed to decode PAYMENT-RESPONSE: ${e}`);
          }
        }
        
        // ALWAYS record the sale (broadcast SSE event) even if txHash extraction failed
        try {
          const recordResponse = await fetch(`${CONFIG.SERVER_URL}/api/market/product/${product_id}/record-sale`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyerWallet: session.sessionId,
              txHash: txHash,
            }),
          });
          const recordResult = await recordResponse.json() as { success?: boolean };
          console.log(`   [x402] 📡 Sale recorded: ${recordResponse.status} - ${recordResult.success ? 'SUCCESS' : 'FAILED'}`);
        } catch (recordError) {
          console.log(`   [x402] ⚠️ Failed to record sale: ${recordError}`);
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
        
        emitSSE({ 
          type: 'tx', 
          data: { 
            amount: product.price, 
            vendor: product.title, 
            vendorId: product_id, 
            txHash, 
            budgetRemaining: session.budget - session.spent, 
            source: 'marketplace' 
          } 
        });
        emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
        
        console.log(`   ✅ REAL PURCHASE COMPLETE! TX: ${txHash}`);
        
        return JSON.stringify({
          success: true,
          source: 'marketplace',
          product: product.title,
          seller: product.sellerName || 'Anonymous',
          type: product.type,
          cost: product.price,
          txHash,
          txUrl: `https://sepolia.basescan.org/tx/${txHash}`,
          budgetRemaining: session.budget - session.spent,
          data: purchasedData,
        });
      }
      
      // =====================================================================
      // ROUTE 2: LEGACY VENDOR PURCHASE (API Data) - REAL PAYMENT
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
      
      console.log(`   💸 REAL PURCHASE: ${vendor.name} ($${vendor.cost.toFixed(2)})...`);
      session.status = 'purchasing';
      
      const fullUrl = `${CONFIG.SERVER_URL}/api/vendor/${product_id}`;
      const response = await fetchWithPayment(fullUrl);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        emitSSE({ type: 'error', data: { message: `Payment failed: ${response.status} - ${errorText}`, code: 'PAYMENT_FAILED' } });
        return JSON.stringify({ success: false, error: `Payment failed: ${response.status}` });
      }
      
      const vendorData = await response.json();
      
      // Extract REAL transaction hash
      let txHash = 'unknown';
      const paymentResponseHeader = response.headers.get('PAYMENT-RESPONSE');
      
      if (paymentResponseHeader) {
        try {
          const decoded = JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString('utf-8'));
          txHash = decoded.transaction || decoded.txHash || 'decoded-but-no-hash';
          console.log(`   [x402] ✅ REAL TX HASH: ${txHash}`);
          console.log(`   [x402] 🔗 Verify: https://sepolia.basescan.org/tx/${txHash}`);
        } catch (e) {
          console.log(`   [x402] ⚠️ Failed to decode PAYMENT-RESPONSE: ${e}`);
        }
      }
      
      session.spent += vendor.cost;
      session.transactions.push({ 
        vendorId: product_id, 
        vendorName: vendor.name, 
        amount: vendor.cost, 
        txHash, 
        timestamp: new Date().toISOString(), 
        justification, 
        source: 'legacy_vendor' 
      });
      
      emitSSE({ type: 'tx', data: { amount: vendor.cost, vendor: vendor.name, vendorId: product_id, txHash, budgetRemaining: session.budget - session.spent, source: 'legacy_vendor' } });
      emitSSE({ type: 'budget', data: { total: session.budget, spent: session.spent, remaining: session.budget - session.spent } });
      
      console.log(`   ✅ REAL PURCHASE COMPLETE! TX: ${txHash}`);
      
      return JSON.stringify({ 
        success: true, 
        source: 'legacy_vendor', 
        vendor: vendor.name, 
        cost: vendor.cost, 
        txHash,
        txUrl: `https://sepolia.basescan.org/tx/${txHash}`,
        budgetRemaining: session.budget - session.spent, 
        data: vendorData 
      });
    },
    {
      name: 'purchase_data',
      description: 'Purchase data from InfoMart marketplace OR legacy vendor using REAL x402 payment. Payment is settled on-chain (Base Sepolia). ONLY call after log_reasoning with status="Approved".',
      schema: z.object({
        product_id: z.string().describe('The product/vendor ID to purchase from'),
        source: z.enum(['marketplace', 'legacy_vendor']).describe('Source: "marketplace" for human alpha products, "legacy_vendor" for API data'),
        justification: z.string().describe('Why this data is worth the cost'),
      }),
    }
  );
}

// =============================================================================
// TOOL: RATE PRODUCT (SLASHING MECHANISM)
// =============================================================================

export function createRateProductTool(emitSSE: (event: SSEEvent) => void) {
  return tool(
    async ({ productId, rating, reason }: { productId: string; rating: number; reason: string }) => {
      console.log(`   📝 Rating product ${productId}: ${rating}/5 - "${reason}"`);
      
      try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/market/product/${productId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, reason }),
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.log(`   ⚠️ Rating failed: ${response.status} - ${errorText}`);
          return JSON.stringify({ success: false, error: `Rating failed: ${response.status}` });
        }
        
        const result = await response.json() as {
          success: boolean;
          productId: string;
          rating: number;
          eventType: 'slash' | 'reward';
          stakeChange: number;
          newStake: number;
          reason: string;
          message: string;
        };
        
        // Log the rating result
        const logEntry: LogEntry = {
          step: 'DECISION',
          thought: result.eventType === 'slash' 
            ? `⚠️ SLASHED: Product rated ${rating}/5. Seller penalized $${Math.abs(result.stakeChange).toFixed(2)}. Reason: ${reason}`
            : `✅ REWARDED: Product rated ${rating}/5. Seller rewarded $${result.stakeChange.toFixed(2)}. Reason: ${reason}`,
          status: result.eventType === 'slash' ? 'Rejected' : 'Approved',
          timestamp: new Date().toISOString(),
          metadata: { 
            productId, 
            rating, 
            eventType: result.eventType, 
            stakeChange: result.stakeChange,
            newStake: result.newStake,
          },
        };
        emitSSE({ type: 'log', data: logEntry });
        
        console.log(`   ${result.eventType === 'slash' ? '🔴' : '🟢'} ${result.message}`);
        
        return JSON.stringify({
          success: true,
          productId: result.productId,
          rating: result.rating,
          eventType: result.eventType,
          stakeChange: result.stakeChange,
          newStake: result.newStake,
          message: result.message,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`   ⚠️ Rating error: ${errorMsg}`);
        return JSON.stringify({ success: false, error: errorMsg });
      }
    },
    {
      name: 'rate_product',
      description: 'Rate a purchased product to reward or penalize the seller. MUST be called IMMEDIATELY after purchase_data to evaluate quality. Low ratings (1-2) slash $2.00 from stake, medium (3) slashes $0.50, high ratings (4-5) reward $0.05.',
      schema: z.object({
        productId: z.string().describe('The product ID that was just purchased'),
        rating: z.number().min(1).max(5).describe('Quality rating 1-5. 1-2=poor (slash $2), 3=mediocre (slash $0.50), 4-5=excellent (reward $0.05)'),
        reason: z.string().describe('Detailed explanation of why this rating was given based on content quality'),
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
    createRateProductTool(emitSSE),
  ];
  const llmWithTools = llm.bindTools(tools);
  
  // Use InfoMart prompt with marketplace products
  const systemPrompt = getInfoMartSystemPrompt(initialProducts);
  const messages: BaseMessage[] = [new SystemMessage(systemPrompt), new HumanMessage(query)];
  
  let iterations = 0;
  const MAX_ITERATIONS = 25; // Increased to handle multiple purchases + ratings
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
    if (iterations >= MAX_ITERATIONS) {
      console.log(`\n⚠️ Max iterations (${MAX_ITERATIONS}) reached. Generating final answer from collected data...`);
      // Generate a final answer from what we have
      finalAnswer = session.transactions.length > 0 
        ? `Based on ${session.transactions.length} purchased sources, here's what I found:\n\n` +
          session.transactions.map(t => `- ${t.vendorName} (${t.source})`).join('\n') +
          `\n\nTotal spent: $${session.spent.toFixed(2)}. Please ask a follow-up question for synthesis.`
        : 'I was unable to complete the analysis within the iteration limit. Please try a more specific query.';
    }
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
