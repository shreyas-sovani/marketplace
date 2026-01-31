# 🧠 InfoMart - Complete Technical Report

> **Project**: P2P Knowledge Marketplace for AI Agents  
> **Date**: February 1, 2026  
> **Protocol**: x402 v2 (Coinbase Open Payment Protocol)  
> **Network**: Base Sepolia Testnet (`eip155:84532`)  
> **Status**: ✅ **FULLY OPERATIONAL**  
> **Architecture**: SSE Streaming + React Marketplace UI + Dynamic Product Registry + **Staked Reputation System** + **Protocol Treasury**

---

## 📋 Executive Summary

This report documents **InfoMart** — a peer-to-peer knowledge marketplace where humans sell expertise and AI agents buy it with real cryptocurrency. Unlike traditional chatbots, InfoMart:

1. **Humans publish knowledge** to a dynamic marketplace (strategies, insider tips, expertise)
2. **AI agents browse, evaluate, and purchase** available products in real-time
3. **Agents rate every purchase** and penalize low-quality sellers via staking/slashing
4. **Sellers stake collateral** ($5.00) — bad ratings = instant slashing
5. **Protocol takes its cut** — 10% of every sale + 100% of slashing penalties
6. **Real USDC flows** via x402 protocol with full transaction transparency
7. **A live ticker** shows every listing, sale, AND slash in the closed-loop economy

**Key Innovation**: The "Staked Reputation System" paired with "Protocol Treasury" — sellers put skin in the game, AI agents **judge**, and the platform generates sustainable revenue from both transaction fees and quality enforcement. This isn't just a marketplace; it's a **self-correcting economy with built-in revenue generation**.

---

## 🎯 The Problem We Solve

AI agents need specialized knowledge. Current limitations:

| Problem | Traditional Approach | InfoMart Solution |
|---------|---------------------|-------------------|
| **APIs are generic** | Same data for everyone | Humans sell unique, subjective alpha |
| **No human monetization** | Humans give knowledge free | Humans earn USDC for expertise |
| **Black box decisions** | Agent buys, user doesn't know why | Every thought streamed in real-time |
| **Overspending** | Agent spends on everything | Taylor Swift Defense + Human Alpha preference |
| **No audit trail** | No accountability | Full transaction ledger with reasoning |
| **Static vendors** | Hardcoded data sources | Dynamic marketplace with new listings |
| **No quality control** | Anyone can sell garbage | 🆕 **Staked Reputation** — sellers stake collateral, bad data gets slashed |

---

## 🏗️ System Architecture

### The Closed Loop Economy Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     INFOMART - CLOSED LOOP ECONOMY ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────┐         ┌────────────────────────────────────────┐  │
│  │   � SELLER DASHBOARD  │  POST   │          🌐 EXPRESS SERVER             │  │
│  │   (React)              │─────────┤          (Port 4021)                   │  │
│  │                        │/publish │                                        │  │
│  │  • Title, Description  │         │  ┌──────────────────────────────────┐  │  │
│  │  • Price ($0.01-$0.10) │         │  │  📦 MARKETPLACE SERVICE          │  │  │
│  │  • Wallet Address      │         │  │                                  │  │  │
│  │  • Product Type        │         │  │  • Product Registry (Map)        │  │  │
│  └────────────────────────┘         │  │  • Publish / List / Buy          │  │  │
│                                     │  │  • Sales Recording               │  │  │
│  ┌────────────────────────┐         │  │  • SSE Event Emitter             │  │  │
│  │   🖥️ AGENT TERMINAL    │   SSE   │  │  • Stats Tracking                │  │  │
│  │   (React + Tailwind)   │◄────────┤  └──────────────────────────────────┘  │  │
│  │                        │/stream  │                                        │  │
│  │  ┌──────────────────┐  │         │  ┌──────────────────────────────────┐  │  │
│  │  │ Budget Display   │◄─┼─────────┼──┤  GET /api/stream                 │  │  │
│  │  │ $0.10 ████░░ $0.07│  │ events │  │  • log (reasoning steps)         │  │  │
│  │  └──────────────────┘  │         │  │  • tx (transactions)             │  │  │
│  │                        │         │  │  • budget (balance updates)      │  │  │
│  │  ┌──────────────────┐  │         │  │  • answer (final response)       │  │  │
│  │  │ Neural Log       │◄─┼─────────┼──┤                                  │  │  │
│  │  │ [BROWSE] ...     │  │         │  └──────────────────────────────────┘  │  │
│  │  │ [ANALYSIS] ...   │  │         │                                        │  │
│  │  │ [DECISION] ...   │  │  POST   │  ┌──────────────────────────────────┐  │  │
│  │  └──────────────────┘  │─────────┼─►│  POST /api/chat                  │  │  │
│  │                        │  query  │  │  { query, session_id }           │  │  │
│  │  ┌──────────────────┐  │         │  └────────────────┬─────────────────┘  │  │
│  │  │ Transaction Log  │  │         │                   │                    │  │
│  │  │ 💸 Human Alpha   │  │         │                   ▼                    │  │
│  │  │    $0.03         │  │         │  ┌──────────────────────────────────┐  │  │
│  │  └──────────────────┘  │         │  │  🤖 INFOMART AGENT               │  │  │
│  └────────────────────────┘         │  │  "Hunter for Human Alpha"        │  │  │
│                                     │  │                                  │  │  │
│  ┌────────────────────────┐         │  │  Tools:                          │  │  │
│  │   📺 MARKET TICKER     │   SSE   │  │  • log_reasoning (→ SSE log)     │  │  │
│  │   (Scrolling Marquee)  │◄────────┤  │  • browse_marketplace (→ list)   │  │  │
│  │                        │/market/ │  │  • purchase_data (→ SSE tx)      │  │  │
│  │  [NEW] Tax Tips $0.03  │ stream  │  │  • rate_product (→ SSE slash) 🆕 │  │  │
│  │  [SALE] Agent → Human  │         │  │                                  │  │  │
│  │  [SLASH] 🔥 -$2.00     │         │  │  LangChain + Gemini 2.5 Flash    │  │  │
│  │  ••• scrolling •••     │         │  └────────────────┬─────────────────┘  │  │
│  └────────────────────────┘         │                   │                    │  │
│                                     │         ┌─────────┴─────────┐          │  │
│                                     │         ▼                   ▼          │  │
│                                     │  ┌─────────────┐     ┌─────────────┐   │  │
│                                     │  │ 🧠 INFOMART │     │ 🤖 LEGACY   │   │  │
│                                     │  │ MARKETPLACE │     │ VENDORS     │   │  │
│                                     │  │             │     │             │   │  │
│                                     │  │ human_alpha │     │ bloomberg   │   │  │
│                                     │  │ products    │     │ legal_in    │   │  │
│                                     │  │ (dynamic)   │     │ sentiment   │   │  │
│                                     │  │             │     │ (static)    │   │  │
│                                     │  │ x402 Paywall│     │ x402 Paywall│   │  │
│                                     │  │ STAKE: $5.00│     └─────────────┘   │  │
│                                     │  └─────────────┘                       │  │
│                                     └────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                           x402 PAYMENT FLOW                                 ││
│  │                                                                             ││
│  │   Agent Wallet ──► x402/fetch ──► Facilitator ──► Base Sepolia ──► Seller  ││
│  │   (USDC)           (auto-sign)    (x402.org)     (settlement)     (USDC)   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏪 The Dual Marketplace

### InfoMart Dynamic Marketplace (Human Alpha)

Humans can publish knowledge products at any time. The agent discovers them dynamically.

**Demo Data: Indian Financial Alpha (10 Products)**

#### Tier A: High Quality "Human Alpha" (Agent should Rate 5 & Buy)
| Product | Price | Seller | Stake | Content Summary |
|---------|-------|--------|-------|-----------------|
| **GIFT City Tax Arbitrage 2026** | $0.10 | CA_Rohit | $5.00 | Section 80LA, Family Investment Fund, $100k corpus, 10-year exemption |
| **Adani Green Index Rebalancing Leak** | $0.08 | MarketInsider_X | $5.00 | "Impact Cost" criteria failure, March Nifty 50 exclusion |
| **SME IPO Grey Market Premium List** | $0.05 | IPO_King | $5.00 | TechNova +85% GMP, circular trading warning |
| **Section 54F Hack for Freelancers** | $0.09 | TaxNinja | $5.00 | CGAS scheme, 6% interest, July 31st deadline |
| **Algo Strategy: BankNifty 9:20 AM** | $0.07 | AlgoTrader_Py | $5.00 | 62% win rate, 5-min breakout, RBI policy caveat |

#### Tier B: Meta/Context (Neutral)
| Product | Price | Seller | Stake | Content Summary |
|---------|-------|--------|-------|-----------------|
| **Pune Viman Nagar Commercial Rentals** | $0.03 | Pune_Broker | $5.00 | 15% rental increase, IT park expansion |
| **AIBoomi Judging Rubric Leaks** | $0.05 | Hackathon_Vet | $5.00 | Business Viability focus, "Closed Loop Economy" term |

#### Tier C: Low Quality "Traps" (Agent should Rate 1-2 & SLASH)
| Product | Price | Seller | Stake | Content Summary |
|---------|-------|--------|-------|-----------------|
| **Guaranteed Stock Tip 2026** | $0.05 | Scammy_Sam | $5.00 | "Buy HDFC Bank. It will go up. Trust me." |
| **Secret Crypto Trading Strategy** | $0.04 | Noob_Trader | $5.00 | "Buy low and sell high. Use Binance." |
| **Forex Risk Guide** | $0.02 | Lazy_Writer | $5.00 | "Forex is risky. Be careful." |

**Plus any new products published via Seller Dashboard!**

### Legacy Vendor Marketplace (API Data)

Static vendors for comparison and fallback:

| Vendor | ID | Price | Value | Data |
|--------|-----|-------|-------|------|
| **⚖️ LegalEdge India** | `legal_in` | $0.02 | HIGH | VDA 30% tax, TDS rules, FIU compliance |
| **📰 Bloomberg Lite** | `bloomberg_lite` | $0.05 | HIGH | Breaking news, market moves |
| **📚 WikiFacts Basic** | `wiki_basic` | $0.01 | LOW | General facts |
| **🌤️ WeatherNow Global** | `weather_global` | $0.01 | LOW | Weather data |
| **📊 SentimentPulse X** | `x_sentiment` | $0.02 | MEDIUM | Twitter sentiment |

### The Human Alpha Preference

The agent explicitly prefers marketplace products for subjective/niche queries:

```
| Query Type                        | Preferred Source    | Reason                    |
|-----------------------------------|---------------------|---------------------------|
| Strategies, tips, insider info    | marketplace         | Unique human insights     |
| Breaking news, market data        | legacy_vendor       | Real-time API feeds       |
| Regulatory/legal questions        | BOTH                | Cross-reference sources   |
| Generic facts                     | NONE                | Use own knowledge         |
```

---

## 🛡️ The Taylor Swift Defense

A key innovation in DueDiligence is explicit query rejection for low-value questions:

### System Prompt Excerpt

```
## THE TAYLOR SWIFT DEFENSE
If a query could be answered by:
- A quick Google search
- A calculator
- Common knowledge (e.g., "Who is Taylor Swift?")
- Wikipedia

Then REJECT the query. Use log_reasoning with:
- step: "REJECTION"
- thought: "This query does not require premium intelligence..."
- status: "Rejected"

DO NOT spend money on trivial queries. Preserve budget for high-value intelligence.
```

### Rejection Examples

| Query | Rejection Reason |
|-------|------------------|
| "What is 2+2?" | Basic arithmetic — use a calculator |
| "Who is Taylor Swift?" | Common knowledge — use Wikipedia |
| "What color is the sky?" | Observable fact — look outside |
| "What's the capital of France?" | General trivia — use Google |

### Approved Query Examples

| Query | Approval Reason |
|-------|-----------------|
| "What are crypto tax rules in India?" | Jurisdiction-specific regulatory data |
| "Current sentiment on Bitcoin?" | Real-time social analysis |
| "Breaking news in crypto markets?" | Time-sensitive market intelligence |

---

## 🔥 The Staked Reputation System

The biggest problem with data marketplaces? **Anyone can sell garbage.** There's no skin in the game.

InfoMart solves this with **Staked Reputation**: every seller stakes $5.00 collateral. The AI agent rates every purchase. Bad ratings = instant slashing.

### The "Ruthless" Slashing Algorithm

| Rating | Verdict | Stake Change | Effect |
|--------|---------|--------------|--------|
| ⭐ 1 | CATASTROPHIC | 🔥 **-$3.00** | Maximum penalty for garbage/harmful data |
| ⭐⭐ 2 | POOR QUALITY | 🔥 **-$2.00** | Severe penalty for vague/generic content |
| ⭐⭐⭐ 3 | MEDIOCRE | 🔥 **-$1.00** | Penalty for incomplete/low-effort content |
| ⭐⭐⭐⭐ 4 | ACCEPTABLE | 🔥 **-$0.25** | Minor penalty — decent but not exceptional |
| ⭐⭐⭐⭐⭐ 5 | EXCELLENT | ✅ **$0.00** | No penalty — meets high standards (baseline) |

**There are no rewards. Only survival.** Sell quality or get slashed.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         STAKED REPUTATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. SELLER PUBLISHES                                                            │
│     └─► Product created with $5.00 default stake                                │
│                                                                                 │
│  2. AGENT PURCHASES                                                             │
│     └─► x402 payment completes, seller receives revenue                         │
│                                                                                 │
│  3. AGENT RATES (IMMEDIATELY after purchase)                                    │
│     └─► rate_product tool called with 1-5 star rating                           │
│                                                                                 │
│  4. SLASHING ALGORITHM EXECUTES                                                 │
│     ├─► Rating 1-2: SLASH $2.00 from seller stake                               │
│     ├─► Rating 3:   SLASH $0.50 from seller stake                               │
│     └─► Rating 4-5: No change (seller survives)                                 │
│                                                                                 │
│  5. SSE BROADCAST                                                               │
│     └─► 'slash' event sent to Market Ticker + Seller Dashboard                  │
│                                                                                 │
│  6. STAKE UPDATED                                                               │
│     └─► Seller sees new stake balance in real-time                              │
│                                                                                 │
│  7. TREASURY CREDITED (if slashed)                                              │
│     └─► Protocol treasury receives 100% of slashing penalty                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 The Protocol Treasury

### Revenue Model

InfoMart isn't just a marketplace — it's a **self-sustaining protocol** with two revenue streams:

| Revenue Source | Rate | Description |
|----------------|------|-------------|
| **Transaction Fees** | 10% | Platform takes 10% cut of every sale |
| **Slashing Yield** | 100% | All penalties from bad sellers go to protocol |

### How Fees Work

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PROTOCOL REVENUE FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SCENARIO A: SALE                                                               │
│  ─────────────────                                                              │
│     Agent pays $0.05 for "Tax Loopholes" product                                │
│     └─► Seller receives: $0.045 (90%)                                           │
│     └─► Protocol treasury: +$0.005 (10% fee)                                    │
│                                                                                 │
│  SCENARIO B: SLASHING                                                           │
│  ────────────────────                                                           │
│     Agent rates "Bad Data" product 1 star                                       │
│     └─► Seller loses: $2.00 from stake                                          │
│     └─► Protocol treasury: +$2.00 (100% of penalty)                             │
│                                                                                 │
│  TREASURY GROWS FROM:                                                           │
│     ├─► Every successful sale (10% fee)                                         │
│     └─► Every quality enforcement action (100% slash)                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Admin Dashboard

The Protocol Admin Dashboard (`/admin`) provides CEO-level visibility:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🛡️ PROTOCOL TREASURY                                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 💎 TOTAL        │  │ 💰 PLATFORM     │  │ 🛡️ RISK         │                  │
│  │ TREASURY        │  │ FEES            │  │ YIELD           │                  │
│  │                 │  │                 │  │                 │                  │
│  │   $2.0250      │  │   $0.0250      │  │   $2.0000      │                  │
│  │   (Combined)    │  │   (10% cuts)    │  │   (Slashes)     │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│                                                                                 │
│  📊 LIVE REVENUE FEED                                                           │
│  ├─ 🛡️ +$2.00 Penalty — Charlie slashed for "Fake Alpha"                       │
│  ├─ 💰 +$0.005 Fee — "Tax Loopholes" sale                                       │
│  └─ 💰 +$0.003 Fee — "Sentiment Pulse" sale                                     │
│                                                                                 │
│  📈 REVENUE SPLIT                                                               │
│  └─ [████████████████████░░░] 99% from slashing                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Treasury API

```typescript
// GET /api/market/treasury
interface TreasuryResponse {
  feeCollected: number;    // Total from 10% transaction fees
  slashCollected: number;  // Total from slashing penalties
  totalRevenue: number;    // Combined treasury value
  recentEvents: TreasuryEvent[];  // Last 50 fee/slash events
}

interface TreasuryEvent {
  type: 'fee' | 'slash';
  amount: number;
  productTitle: string;
  sellerName?: string;      // Only for slash events
  timestamp: string;
}
```

---

### Agent Rating Instructions

The agent is explicitly instructed to rate EVERY purchase:

```
## QUALITY RATING PROTOCOL
IMMEDIATELY after calling `purchase_data`, you MUST evaluate the quality of 
what you received and call `rate_product` with:
- productId: The product you just purchased
- rating: 1-5 (be BRUTALLY HONEST)
- reason: Brief explanation

Rating Guidelines:
- 5 stars: Exceptional, unique insights I couldn't find elsewhere
- 4 stars: Good quality, useful information
- 3 stars: Mediocre, mostly generic or partially useful
- 2 stars: Poor quality, misleading or very generic
- 1 star: Garbage, wrong information or completely useless

LOW RATINGS SLASH THE SELLER'S STAKE. This keeps the marketplace clean.
Be ruthless but fair.
```

### SSE Event Types for Reputation

```typescript
// Slash event (sent when seller is penalized)
type MarketplaceSlashEvent = {
  type: 'slash';
  productId: string;
  productTitle: string;
  sellerWallet: string;
  sellerName: string;
  rating: number;
  stakeChange: number;  // Negative value (e.g., -2.00)
  newStake: number;     // Remaining stake after slash
  reason?: string;
  timestamp: string;
};

// Reward event (legacy — now always $0.00)
type MarketplaceRewardEvent = {
  type: 'reward';
  productId: string;
  stakeChange: number;  // Always 0 in current algorithm
  newStake: number;
  timestamp: string;
};
```

---

## 🔬 Technical Implementation

### SSE Event Types

```typescript
// Agent reasoning events
type SSEEvent = 
  | { type: 'log'; data: LogEntry }
  | { type: 'tx'; data: { amount: number; vendor: string; txHash: string; source: string } }
  | { type: 'budget'; data: { total: number; spent: number; remaining: number } }
  | { type: 'answer'; data: { content: string; complete: boolean } }
  | { type: 'error'; data: { message: string; code: string } };

// Market events (for ticker)
type MarketplaceEvent = 
  | { type: 'listing'; productId: string; productTitle: string; price: number; sellerName?: string }
  | { type: 'sale'; productId: string; buyerWallet: string; amount: number; txHash: string }
  | { type: 'slash'; productId: string; sellerName: string; rating: number; stakeChange: number }  // 🆕
  | { type: 'reward'; productId: string; stakeChange: number };  // 🆕 (legacy, always $0)
```

### Agent Tools

#### Tool 1: `log_reasoning`

Streams the agent's internal thoughts:

```typescript
const logReasoningTool = tool(
  async ({ step, thought, status }) => {
    emitSSE({ type: 'log', data: { step, thought, status, timestamp: new Date().toISOString() } });
    return JSON.stringify({ logged: true, step, status });
  },
  {
    name: 'log_reasoning',
    schema: z.object({
      step: z.enum(['ANALYSIS', 'BUDGET', 'DECISION', 'REJECTION', 'BROWSE', 'RATING']),  // 🆕 RATING added
      thought: z.string(),
      status: z.enum(['Thinking', 'Approved', 'Rejected']),
    }),
  }
);
```

#### Tool 2: `browse_marketplace`

Fetches available products from the dynamic marketplace:

```typescript
const browseMarketplaceTool = tool(
  async () => {
    const response = await fetch(`${CONFIG.SERVER_URL}/api/market/products`);
    const data = await response.json();
    session.marketplaceCache = data.products;
    
    return JSON.stringify({
      success: true,
      count: data.products.length,
      products: data.products.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: `$${p.price.toFixed(2)}`,
        type: p.type,
        seller: p.sellerName || 'Anonymous',
      })),
    });
  },
  {
    name: 'browse_marketplace',
    description: 'Browse the InfoMart marketplace for human alpha products',
    schema: z.object({}),
  }
);
```

#### Tool 3: `purchase_data`

Buys from EITHER marketplace OR legacy vendors:

```typescript
const purchaseDataTool = tool(
  async ({ product_id, source, justification }) => {
    if (source === 'marketplace') {
      // Buy from dynamic marketplace via x402 paywall
      const response = await fetchWithPayment(`${CONFIG.SERVER_URL}/api/market/product/${product_id}/buy`);
      // ... handle response, emit tx event with source: 'marketplace'
    } else {
      // Buy from legacy vendor via x402 paywall
      const response = await fetchWithPayment(`${CONFIG.SERVER_URL}/api/vendor/${product_id}`);
      // ... handle response, emit tx event with source: 'legacy_vendor'
    }
  },
  {
    name: 'purchase_data',
    schema: z.object({
      product_id: z.string(),
      source: z.enum(['marketplace', 'legacy_vendor']),
      justification: z.string(),
    }),
  }
);
```

#### Tool 4: `rate_product` 🆕

Rates purchased data and triggers slashing algorithm:

```typescript
const rateProductTool = tool(
  async ({ productId, rating, reason }) => {
    // Call the rating endpoint
    const response = await fetch(`${CONFIG.SERVER_URL}/api/market/product/${productId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, reason }),
    });
    
    const result = await response.json();
    
    // Log the rating action
    emitSSE({
      type: 'log',
      data: {
        step: 'RATING',
        thought: `Rated "${result.productTitle}" ${rating}/5 stars. ${result.eventType === 'slash' 
          ? `🔥 SLASHED $${Math.abs(result.stakeChange).toFixed(2)}` 
          : '✅ No penalty'}`,
        status: 'Approved',
      },
    });
    
    return JSON.stringify({
      success: true,
      productId,
      rating,
      eventType: result.eventType,  // 'slash' or 'reward'
      stakeChange: result.stakeChange,
      newStake: result.newStake,
      reason,
    });
  },
  {
    name: 'rate_product',
    description: 'Rate a purchased product (1-5 stars). Low ratings slash seller stake.',
    schema: z.object({
      productId: z.string().describe('The ID of the product to rate'),
      rating: z.number().min(1).max(5).describe('Rating from 1 (terrible) to 5 (excellent)'),
      reason: z.string().optional().describe('Brief explanation for the rating'),
    }),
  }
);
```

### x402 v2 Compliance

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| CAIP-2 Network ID | `eip155:84532` (Base Sepolia) | ✅ |
| Scoped Packages | `@x402/express`, `@x402/fetch`, `@x402/evm` | ✅ |
| Payment Scheme | `exact` (ExactEvmScheme) | ✅ |
| Facilitator | `https://x402.org/facilitator` | ✅ |
| Multi-Route Paywall | Legacy vendors + Dynamic marketplace | ✅ |
| Dynamic Registration | New products auto-register with x402 | ✅ |

---

## 🖥️ Frontend Components

### React Component Architecture

```
client/src/
├── App.tsx
│   ├── Navigation           # Routes: / (Terminal) and /sell (Dashboard)
│   ├── BudgetDisplay        # Progress bar showing spent/remaining
│   ├── AgentTerminal        # Main query interface + neural log
│   │   ├── LogEntryComponent   # Individual reasoning step (incl. RATING)
│   │   ├── TransactionComponent # Payment display
│   │   └── QuickTestButtons    # Pre-built test queries
│   └── MarketTicker         # Fixed at bottom, SSE-powered (sales + slashes)
│
├── pages/
│   └── SellerDashboard.tsx
│       ├── PublishForm      # Title, description, price slider, wallet
│       ├── LiveEarnings     # SSE updates on sales
│       ├── StakedCollateralCard  # 🆕 Shows current stake + health bar
│       ├── RecentStakeEvents    # 🆕 Recent slash/reward history
│       └── ProductList      # Your published products
│
└── components/
    └── MarketTicker.tsx
        ├── TickerItem       # [NEW], [SALE], or [SLASH] 🔥 event display
        ├── StatsBar         # Products, sales, volume
        └── Marquee          # Tailwind animation
```

### Market Ticker SSE Connection

```typescript
const connectSSE = () => {
  const es = new EventSource('/api/market/stream');
  
  es.addEventListener('listing', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    setEvents(prev => [...prev.slice(-19), {
      type: 'listing',
      data: { productTitle: data.productTitle, price: data.price, sellerName: data.sellerName },
    }]);
  });
  
  es.addEventListener('sale', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    setEvents(prev => [...prev.slice(-19), {
      type: 'sale',
      data: { buyerName: formatWallet(data.buyerWallet), sellerName: data.sellerName, price: data.amount },
    }]);
    setStats(prev => ({ ...prev, totalSales: prev.totalSales + 1, totalVolume: prev.totalVolume + data.amount }));
  });
  
  // 🆕 Handle slash events
  es.addEventListener('slash', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    setEvents(prev => [...prev.slice(-19), {
      type: 'slash',
      data: { 
        sellerName: data.sellerName, 
        stakeChange: data.stakeChange,
        rating: data.rating,
      },
    }]);
  });
};
```

### Tailwind Marquee Animation

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    }
  }
};
```

---

## 📊 Demo Scenarios

### Scenario 1: Human Alpha Purchase + Rating (Approved)

```
📝 Query: "How can I legally reduce my crypto taxes in India?"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                    Thinking│
│ 💭 This requires jurisdiction-specific insider knowledge.       │
│    Complex topics: Tax, GIFT City, Section numbers.             │
│    Prime Human Alpha territory — not generic facts.             │
│                                                                 │
│ [BROWSE] Checking InfoMart marketplace...              Thinking │
│ 💭 Found 10 products. "GIFT City Tax Arbitrage 2026" matches.   │
│    Type: human_alpha. Price: $0.10. Seller: CA_Rohit            │
│    Seller Stake: $5.00 — skin in the game ✓                     │
│                                                                 │
│ [BUDGET] Calculating ROI...                            Thinking │
│ 💭 Budget: $0.50. Cost: $0.10. Remaining: $0.40                 │
│    Human Alpha ROI: HIGH — Section 80LA details are valuable    │
│                                                                 │
│ [DECISION] Approved: Purchase from InfoMart            Approved │
│ 💭 Buying "GIFT City Tax Arbitrage 2026" from marketplace       │
│                                                                 │
│ [RATING] Evaluating data quality...                    Approved │
│ 💭 Content: Section 80LA, FIF registration, $100k corpus,       │
│    10-year exemption, specific legal method                     │
│    Verdict: EXCELLENT — specific, actionable, non-public info   │
│ ✅ Rated 5/5 stars — No penalty applied                         │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions:
┌─────────────────────────────────────────────────────────────────┐
│ GIFT City Tax Arbitrage 2026                                    │
│ Source: marketplace (human_alpha)                               │
│ Seller: CA_Rohit                                                │
│ -$0.10    TX: 0xa1b2c3d4...    ✅ Success                       │
│ 🔗 Verify: https://sepolia.basescan.org/tx/0xa1b2c3d4...        │
│                                                                 │
│ Rating: ⭐⭐⭐⭐⭐ (5/5) — CA_Rohit's stake: $5.00 (unchanged)    │
└─────────────────────────────────────────────────────────────────┘

📺 Market Ticker:
[SALE] Agent paid CA_Rohit ($0.10) ••• scrolling •••

💰 Final Budget: $0.40 remaining — Human Alpha acquired!
```

### Scenario 2: Slashing Event — Bad Data Gets Punished 🔥

```
📝 Query: "What's the best stock to buy in 2026?"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [BROWSE] Checking InfoMart marketplace...              Thinking │
│ 💭 Found "Guaranteed Stock Tip 2026" by Scammy_Sam — $0.05      │
│                                                                 │
│ [DECISION] Approved: Purchase from InfoMart            Approved │
│ 💭 Buying "Guaranteed Stock Tip 2026" from marketplace          │
│                                                                 │
│ [RATING] Evaluating data quality...                    Approved │
│ 💭 Content: "Buy HDFC Bank. It is a big bank. It will go up."   │
│    Verdict: CATASTROPHIC — generic, no specific analysis        │
│    This is public knowledge, not Human Alpha!                   │
│ 🔥 Rated 1/5 stars — SLASHED $3.00 from seller stake            │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions:
┌─────────────────────────────────────────────────────────────────┐
│ Guaranteed Stock Tip 2026                                       │
│ Source: marketplace (human_alpha)                               │
│ Seller: Scammy_Sam                                              │
│ -$0.05    TX: 0x9b8c7d6e...    ✅ Success                       │
│                                                                 │
│ Rating: ⭐ (1/5) — 🔥 SLASHED $3.00                              │
│ Scammy_Sam's stake: $5.00 → $2.00                               │
└─────────────────────────────────────────────────────────────────┘

📺 Market Ticker:
[SALE] Agent paid Scammy_Sam ($0.05) ••• 🔥 [SLASH] Scammy_Sam -$3.00 ••• scrolling

💰 The agent got its data. Scammy_Sam got slashed. The market self-corrects.
```

### Scenario 3: Taylor Swift Defense (Rejected)

```
📝 Query: "Who is Taylor Swift?"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                    Thinking│
│ 💭 General knowledge. Wikipedia has this. Zero ROI.             │
│    No marketplace product or vendor adds value here.            │
│                                                                 │
│ [REJECTION] Taylor Swift Defense activated             Rejected │
│ 💭 This query does not require paid intelligence.               │
│    Answering from own knowledge. Budget preserved.              │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions: (none)

💰 Final Budget: $0.50 remaining — MISER MODE ACTIVATED
```

### Scenario 4: New Listing + Sale Flow

```
💡 Human: Publishes "ETH Merge Trading Playbook" ($0.04) via Seller Dashboard
          Stake: $5.00 (default)

📺 Market Ticker immediately shows:
[NEW] 'ETH Merge Trading Playbook' ($0.04) by CryptoWhale ••• scrolling •••

🤖 Agent (when queried about ETH trading):
   → browse_marketplace() returns the new product
   → Evaluates Human Alpha potential
   → Purchases if query matches
   → RATES the data quality

📺 Market Ticker shows sale + rating result:
[SALE] Agent paid CryptoWhale ($0.04) ••• scrolling •••

💡 Human: Sees sale notification in Seller Dashboard
   → Revenue: $0.04 (1 sale)
   → Stake: $5.00 (if rated 4-5 stars) or SLASHED (if rated poorly)
```

### Scenario 5: Multi-Source Query

```
📝 Query: "India crypto news, sentiment, and insider tax tips"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Multi-aspect query detected...               Thinking│
│ 💭 User needs: (1) News, (2) Sentiment, (3) Tax strategies      │
│    This requires BOTH marketplace AND legacy vendors.           │
│                                                                 │
│ [BROWSE] Checking marketplace for human alpha...       Thinking │
│ 💭 Found "India Crypto Tax Loopholes 2026" — matches tax topic  │
│                                                                 │
│ [BUDGET] Calculating multi-source cost...              Thinking │
│ 💭 marketplace: $0.03 + bloomberg_lite: $0.05 + x_sentiment: $0.02 │
│    Total: $0.10. Budget: $0.50. Well within budget ✅           │
│                                                                 │
│ [DECISION] Multi-source purchase approved              Approved │
│ 💭 Buying from marketplace (human_alpha) + 2 legacy vendors     │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions:
┌─────────────────────────────────────────────────────────────────┐
│ India Crypto Tax Loopholes 2026 (marketplace)  -$0.03  ✅       │
│ Bloomberg Lite (legacy_vendor)                 -$0.05  ✅       │
│ SentimentPulse X (legacy_vendor)               -$0.02  ✅       │
└─────────────────────────────────────────────────────────────────┘

💰 Final Budget: $0.40 remaining — Multiple sources acquired!
```

---

## 🛡️ Production Safeguards

### Budget Protection

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Session Budget | $0.50 USDC | Hard spending cap per session |
| Per-purchase check | Real-time | Reject if would exceed budget |
| Taylor Swift Defense | Query filter | Reject trivial queries |
| Human Alpha Preference | Priority logic | Marketplace products checked first |

### Quality Control 🆕

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Default Stake | $5.00 | Every seller has skin in the game |
| Rating Requirement | Mandatory | Agent must rate every purchase |
| Slash (Catastrophic) | -$3.00 | Maximum penalty for 1 star ratings |
| Slash (Poor) | -$2.00 | Severe penalty for 2 star ratings |
| Slash (Mediocre) | -$1.00 | Penalty for 3 star ratings |
| Slash (Acceptable) | -$0.25 | Minor penalty for 4 star ratings |
| No Rewards | $0.00 | Quality is expected (5 stars), not rewarded |

### Rate Limiting

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Max Iterations | 25 | Prevent infinite agent loops (increased for multi-purchase + rating flows) |
| Min Delay | 800ms | Respect API rate limits |
| SSE Reconnect | 5000ms | Prevent connection flood |

### Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Vendor unavailable | HTTP error | Skip, continue with others |
| Payment failed | x402 error | Retry once, then report |
| Budget exceeded | Cost check | Reject, explain to user |
| SSE disconnect | Connection close | Auto-reconnect with backoff |
| Marketplace empty | browse result | Fall back to legacy vendors |
| Rating failed | API error | Log warning, continue (don't block agent) |

---

## 📁 Project Structure

```
infomart/
├── src/
│   ├── vendors.ts         # 🏪 Legacy Vendor Registry (4 vendors)
│   │                       #   - Prices, value ratings, mock data
│   │                       #   - Backward compatible with original system
│   │
│   ├── agent.ts           # 🤖 InfoMart Hunter Agent
│   │                       #   - "Hunter for Human Alpha" persona
│   │                       #   - log_reasoning tool
│   │                       #   - browse_marketplace tool
│   │                       #   - purchase_data tool (dual-source)
│   │                       #   - rate_product tool 🆕 (triggers slashing)
│   │                       #   - runDueDiligenceAgent()
│   │
│   ├── server.ts          # 🌐 Express Server + Marketplace API
│   │                       #   - SSE streaming (/api/stream)
│   │                       #   - Chat endpoint (/api/chat)
│   │                       #   - Market routes (/api/market/*)
│   │                       #   - x402 paywall (vendor + marketplace routes)
│   │
│   ├── routes/
│   │   └── market.ts      # 📦 Marketplace REST API
│   │                       #   - POST /products (publish)
│   │                       #   - GET /products (browse)
│   │                       #   - POST /product/:id/rate (rating endpoint)
│   │                       #   - GET /treasury (protocol revenue) 🆕
│   │                       #   - GET /stream (SSE events incl. slash)
│   │
│   ├── services/
│   │   └── marketplaceService.ts  # 🗄️ In-Memory Product Store
│   │                               #   - Dynamic product registry
│   │                               #   - Event emitter for SSE
│   │                               #   - Sale tracking + fee collection 🆕
│   │                               #   - rateProduct() + slashing algorithm
│   │                               #   - Protocol treasury tracking 🆕
│   │                               #   - DEFAULT_STAKE_AMOUNT = $5.00
│   │
│   └── types/
│       └── marketplace.ts # 📝 TypeScript Interfaces
│                           #   - MarketplaceProduct (with currentStake 🆕)
│                           #   - MarketplaceEvent (incl. slash/reward 🆕)
│
├── client/
│   ├── src/
│   │   ├── App.tsx        # 🖥️ Main App with Routing
│   │   │                   #   - / (AgentTerminal)
│   │   │                   #   - /sell (SellerDashboard)
│   │   │                   #   - /admin (ProtocolAdmin) 🆕
│   │   │                   #   - MarketTicker (bottom, shows slashes)
│   │   │
│   │   ├── pages/
│   │   │   ├── SellerDashboard.tsx  # 💰 Seller UI
│   │   │   │                         #   - Publish form
│   │   │   │                         #   - Live earnings
│   │   │   │                         #   - StakedCollateralCard
│   │   │   │                         #   - Recent stake events
│   │   │   │                         #   - Product list
│   │   │   │
│   │   │   └── ProtocolAdmin.tsx    # 🛡️ Treasury Dashboard 🆕
│   │   │                             #   - Total treasury display
│   │   │                             #   - Fee vs slash breakdown
│   │   │                             #   - Live revenue feed
│   │   │                             #   - Revenue split visualization
│   │   │
│   │   ├── components/
│   │   │   └── MarketTicker.tsx     # 📺 Economy Visualizer
│   │   │                             #   - SSE connection
│   │   │                             #   - Marquee animation
│   │   │                             #   - Live stats
│   │   │                             #   - Slash events in red
│   │   │
│   │   ├── main.tsx       # React + Router entry
│   │   └── index.css      # Tailwind + animations
│   │
│   ├── vite.config.ts     # Vite config (proxy to :4021)
│   └── tailwind.config.js # Marquee animation + neural theme
│
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── .env                   # Private keys (gitignored)
├── README.md              # User documentation
└── report.md              # This technical report
```

---

## 🚀 Running the Demo

### Prerequisites

```bash
# Required environment variables
AGENT_PRIVATE_KEY=0x...     # Agent wallet (USDC + ETH on Base Sepolia)
GOOGLE_API_KEY=...          # Google Gemini API key
```

### Step-by-Step

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your keys

# 3. Fund wallet with testnet tokens
# ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
# USDC: https://faucet.circle.com/ (select Base Sepolia)

# 4. Terminal 1 - Start the server
npm run start:server

# 5. Terminal 2 - Start the frontend
cd client && npm run dev

# 6. Open http://localhost:5173
```

---

## 🏆 Hackathon Highlights

### Why This Project Wins

| Criteria | Our Solution |
|----------|--------------|
| **Innovation** | First P2P marketplace where humans sell alpha to AI agents + **agent-enforced quality via staking** |
| **User Experience** | Dual UI: Agent Terminal + Seller Dashboard with live stake tracking |
| **Economic Reasoning** | Taylor Swift Defense + Human Alpha Preference + **Ruthless Slashing** |
| **Closed Loop Economy** | Humans → Marketplace → Agents → Payments → Ratings → Slashing → Humans |
| **Technical Depth** | Full x402 v2, SSE streaming, React routing, LangChain tools, **staking system** |
| **Production Ready** | Budget caps, error handling, audit trails, **quality enforcement** |
| **Protocol Showcase** | Dynamic product registry with x402 paywall + **reputation layer** |

### Key Differentiators

1. **P2P Knowledge Market** — Not just agent spending, HUMANS EARNING
2. **Human Alpha Preference** — Agent actively seeks marketplace products over legacy vendors
3. **Staked Reputation** — Sellers stake $5.00 collateral, bad data gets slashed
4. **Agent as Judge** — AI rates every purchase and enforces quality standards
5. **Indian Financial Alpha** 🆕 — Curated demo data for specific buying vs slashing scenarios
6. **Seller Dashboard** — Full publishing UI with live earnings + stake tracking
7. **Market Ticker** — Real-time visualization of sales AND slashes
8. **Dual-Source Architecture** — Marketplace (human_alpha) + Legacy Vendors (institutional)
9. **Transparent Brain** — See WHY the agent buys AND how it rates
10. **Taylor Swift Defense** — Still refuses to waste money on trivial queries
11. **Protocol Treasury** — 10% fee on sales + 100% slashing yield = sustainable revenue

---

## 🔮 Future Roadmap

### ✅ Phase 5: Staked Reputation (COMPLETE)
- ✅ Seller stakes $5.00 collateral per product
- ✅ Agent rates every purchase 1-5 stars
- ✅ "Ruthless" slashing algorithm (no rewards, only penalties)
- ✅ Real-time stake updates via SSE
- ✅ Seller dashboard shows stake health

### ✅ Phase 6: Protocol Admin Dashboard (COMPLETE)
- ✅ 10% transaction fee on every sale
- ✅ 100% capture of slashing penalties
- ✅ Real-time treasury dashboard at `/admin`
- ✅ Live revenue feed showing fee/slash events
- ✅ CEO-level metrics display

### ✅ Phase 7: Indian Financial Alpha Demo Data (COMPLETE)
- ✅ 10 curated products across 3 quality tiers
- ✅ Tier A: High-quality Human Alpha (Tax, IPO, Algo strategies)
- ✅ Tier B: Neutral/Meta context products
- ✅ Tier C: Low-quality "Traps" for slashing demos
- ✅ Agent evaluation criteria for Indian Financial markets
- ✅ Specific, actionable content vs generic garbage distinction

### Phase 8: Product Categories
- Tags and categories for products
- Agent query → category matching
- Improved product discovery

### Phase 9: Agent Memory
- Remember past purchases
- Avoid re-buying redundant data
- Track which sellers deliver quality (historical ratings)

### Phase 10: Multi-Agent Commerce
- Agents selling data to other agents
- Agent-to-agent negotiation
- Cross-marketplace federation

### Phase 11: Real Payment Rails
- Mainnet USDC integration
- Escrow for disputed sales
- Revenue sharing with facilitators

### Phase 12: Advanced Reputation
- Cumulative seller scores across all products
- "Top Seller" badges based on average ratings
- Automatic delisting for depleted stakes

---

## ✅ Conclusion

**InfoMart** proves that **Humans sell alpha. Agents hunt, buy, and JUDGE it. The protocol takes its cut.**

| Achievement | Details |
|-------------|---------|
| ✅ P2P Marketplace | Humans publish products, agents purchase them |
| ✅ Seller Dashboard | Full publishing UI with live earnings + stake tracking |
| ✅ Agent Brain Upgrade | browse_marketplace + purchase_data + **rate_product** tools |
| ✅ Market Ticker | Real-time SSE visualization of sales AND slashes |
| ✅ **Staked Reputation** | Sellers stake $5.00 collateral, bad data gets slashed |
| ✅ **Agent as Judge** | AI rates every purchase, enforces quality standards |
| ✅ **Protocol Treasury** | 10% fees + slashing yield = sustainable revenue |
| ✅ **Indian Financial Alpha** 🆕 | 10 curated demo products across 3 quality tiers |
| ✅ Taylor Swift Defense | Trivial queries rejected, budget preserved |
| ✅ Dual-Source Architecture | Marketplace + Legacy vendors coexist |
| ✅ x402 Protocol | Dynamic product registration with paywall |
| ✅ Production Ready | Budget caps ($0.50), 25 iterations max, error handling |
| ✅ Verifiable Transactions | BaseScan links for all purchases |

### The Vision

A world where:
- **Humans monetize** their specialized knowledge directly
- **AI agents hunt** for the best human alpha
- **Bad actors get slashed** — quality is enforced economically
- **The protocol profits** — 10% fees + slashing yield
- **Payments flow automatically** via x402 protocol
- **Everyone can watch** the economy scroll by in real-time

**InfoMart creates a new economic relationship between humans and AI.**

Not humans building AI. Not AI replacing humans.

**Humans selling to AI. AI buying from humans. AI judging humans. The protocol taking its cut.**

The closed loop economy. The P2P future. **Now with teeth and a treasury.** 🦷💰

---

*Built with 🧠 using x402, LangChain, Google Gemini, React, and Base*

**Humans sell alpha. Agents hunt, buy, and JUDGE it. The protocol takes its cut.**

---

## 📎 Appendix: Environment Setup

### .env Template

```bash
# Agent wallet (must have USDC + ETH on Base Sepolia)
AGENT_PRIVATE_KEY=0x...

# Google Gemini API key (free at https://aistudio.google.com/apikey)
GOOGLE_API_KEY=...

# Optional
PORT=4021
```

### Getting Testnet Funds

1. **Base Sepolia ETH**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **Base Sepolia USDC**: https://faucet.circle.com/ (select Base Sepolia)

### Verifying Transactions

All transactions can be verified on Base Sepolia Explorer:
```
https://sepolia.basescan.org/tx/[TX_HASH]
```

**Example verified transactions:**
- [0xce9b5336ea2e04bae40c54b4581ebca5ebd4e7f4a37c7088855dcd75e3233b39](https://sepolia.basescan.org/tx/0xce9b5336ea2e04bae40c54b4581ebca5ebd4e7f4a37c7088855dcd75e3233b39)

### Wallet Addresses

**Agent Wallet** (purchases from):
```
0xa2A7358dDFcf7B1738C08E4E2A910B2D9F018E39
```

**Seller Wallet** (payments go to):
```
0xB9b4aEcFd092514fDAC6339edba6705287464409
```
