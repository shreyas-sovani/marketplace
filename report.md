# 🧠 InfoMart - Complete Technical Report

> **Project**: P2P Knowledge Marketplace for AI Agents  
> **Date**: January 31, 2026  
> **Protocol**: x402 v2 (Coinbase Open Payment Protocol)  
> **Network**: Base Sepolia Testnet (`eip155:84532`)  
> **Status**: ✅ **FULLY OPERATIONAL**  
> **Architecture**: SSE Streaming + React Marketplace UI + Dynamic Product Registry

---

## 📋 Executive Summary

This report documents **InfoMart** — a peer-to-peer knowledge marketplace where humans sell expertise and AI agents buy it with real cryptocurrency. Unlike traditional chatbots, InfoMart:

1. **Humans publish knowledge** to a dynamic marketplace (strategies, insider tips, expertise)
2. **AI agents browse and evaluate** available products in real-time
3. **Agents prefer "Human Alpha"** — unique insights that APIs can't provide
4. **Real USDC flows** via x402 protocol with full transaction transparency
5. **A live ticker** shows every listing and sale in the closed-loop economy

**Key Innovation**: The "Closed Loop Economy" — humans earn money from AI, agents get unique alpha, and you watch it all happen on a scrolling market ticker. This isn't just an AI assistant; it's a **functioning P2P marketplace for human-machine commerce**.

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
│  │  [NEW] Tax Tips $0.03  │ stream  │  │                                  │  │  │
│  │  [SALE] Agent → Human  │         │  │  LangChain + Gemini 2.5 Flash    │  │  │
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
│                                     │  └─────────────┘     └─────────────┘   │  │
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

Humans can publish knowledge products at any time. The agent discovers them dynamically:

| Seeded Product | Price | Type | Seller |
|----------------|-------|------|--------|
| **AIBhoomi Winning Strategy 2026** | $0.05 | human_alpha | Alice (Hackathon Veteran) |
| **India Crypto Tax Loopholes 2026** | $0.03 | human_alpha | Bob (Tax Expert) |
| **Bitcoin Sentiment Pulse - Jan 2026** | $0.02 | human_alpha | Charlie (Market Analyst) |

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
  | { type: 'sale'; productId: string; buyerWallet: string; amount: number; txHash: string };
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
      step: z.enum(['ANALYSIS', 'BUDGET', 'DECISION', 'REJECTION', 'BROWSE']),
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
│   │   ├── LogEntryComponent   # Individual reasoning step
│   │   ├── TransactionComponent # Payment display
│   │   └── QuickTestButtons    # Pre-built test queries
│   └── MarketTicker         # Fixed at bottom, SSE-powered
│
├── pages/
│   └── SellerDashboard.tsx
│       ├── PublishForm      # Title, description, price slider, wallet
│       ├── LiveEarnings     # SSE updates on sales
│       └── ProductList      # Your published products
│
└── components/
    └── MarketTicker.tsx
        ├── TickerItem       # [NEW] or [SALE] event display
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

### Scenario 1: Human Alpha Purchase (Approved)

```
📝 Query: "What strategies do Indian traders use to minimize crypto taxes?"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                    Thinking│
│ 💭 This requires jurisdiction-specific insider knowledge.       │
│    Not generic facts — prime Human Alpha territory.             │
│                                                                 │
│ [BROWSE] Checking InfoMart marketplace...              Thinking │
│ 💭 Found 3 products. "India Crypto Tax Loopholes 2026" matches. │
│    Type: human_alpha. Price: $0.03. Seller: Bob (Tax Expert)    │
│                                                                 │
│ [BUDGET] Calculating ROI...                            Thinking │
│ 💭 Budget: $0.10. Cost: $0.03. Remaining: $0.07                 │
│    Human Alpha ROI: HIGH — insider strategies are valuable      │
│                                                                 │
│ [DECISION] Approved: Purchase from InfoMart            Approved │
│ 💭 Buying "India Crypto Tax Loopholes 2026" from marketplace    │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions:
┌─────────────────────────────────────────────────────────────────┐
│ India Crypto Tax Loopholes 2026                                 │
│ Source: marketplace (human_alpha)                               │
│ Seller: Bob (Tax Expert)                                        │
│ -$0.03    TX: 0xa1b2c3d4...    ✅ Success                       │
└─────────────────────────────────────────────────────────────────┘

📺 Market Ticker:
[SALE] Agent paid Bob ($0.03) ••• scrolling •••

💰 Final Budget: $0.07 remaining — Human Alpha acquired!
```

### Scenario 2: Taylor Swift Defense (Rejected)

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

💰 Final Budget: $0.10 remaining — MISER MODE ACTIVATED
```

### Scenario 3: New Listing + Sale Flow

```
💡 Human: Publishes "ETH Merge Trading Playbook" ($0.04) via Seller Dashboard

📺 Market Ticker immediately shows:
[NEW] 'ETH Merge Trading Playbook' ($0.04) by CryptoWhale ••• scrolling •••

🤖 Agent (when queried about ETH trading):
   → browse_marketplace() returns the new product
   → Evaluates Human Alpha potential
   → Purchases if query matches

📺 Market Ticker shows sale:
[SALE] Agent paid CryptoWhale ($0.04) ••• scrolling •••

💡 Human: Sees sale notification in Seller Dashboard
   → Revenue: $0.04 (1 sale)
```

### Scenario 4: Multi-Source Query

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
│    Total: $0.10. Budget: $0.10. Tight but affordable ✅         │
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

💰 Final Budget: $0.00 remaining — ALL IN ON ALPHA
```

💰 Final Budget: $0.00 remaining — ALL IN ON ALPHA
```

---

## 🛡️ Production Safeguards

### Budget Protection

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Session Budget | $0.10 USDC | Hard spending cap per session |
| Per-purchase check | Real-time | Reject if would exceed budget |
| Taylor Swift Defense | Query filter | Reject trivial queries |
| Human Alpha Preference | Priority logic | Marketplace products checked first |

### Rate Limiting

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Max Iterations | 8 | Prevent infinite agent loops |
| Min Delay | 1000ms | Respect API rate limits |
| SSE Reconnect | 5000ms | Prevent connection flood |

### Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Vendor unavailable | HTTP error | Skip, continue with others |
| Payment failed | x402 error | Retry once, then report |
| Budget exceeded | Cost check | Reject, explain to user |
| SSE disconnect | Connection close | Auto-reconnect with backoff |
| Marketplace empty | browse result | Fall back to legacy vendors |

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
│   │                       #   - browse_marketplace tool (NEW)
│   │                       #   - purchase_data tool (dual-source)
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
│   │                       #   - GET /stream (SSE events)
│   │
│   ├── services/
│   │   └── marketplaceService.ts  # 🗄️ In-Memory Product Store
│   │                               #   - Dynamic product registry
│   │                               #   - Event emitter for SSE
│   │                               #   - Sale tracking
│   │
│   └── types/
│       └── marketplace.ts # 📝 TypeScript Interfaces
│                           #   - MarketplaceProduct
│                           #   - MarketplaceEvent
│
├── client/
│   ├── src/
│   │   ├── App.tsx        # 🖥️ Main App with Routing
│   │   │                   #   - / (AgentTerminal)
│   │   │                   #   - /sell (SellerDashboard)
│   │   │                   #   - MarketTicker (bottom)
│   │   │
│   │   ├── pages/
│   │   │   └── SellerDashboard.tsx  # 💰 Seller UI
│   │   │                             #   - Publish form
│   │   │                             #   - Live earnings
│   │   │                             #   - Product list
│   │   │
│   │   ├── components/
│   │   │   └── MarketTicker.tsx     # 📺 Economy Visualizer
│   │   │                             #   - SSE connection
│   │   │                             #   - Marquee animation
│   │   │                             #   - Live stats
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
| **Innovation** | First P2P marketplace where humans sell alpha to AI agents |
| **User Experience** | Dual UI: Agent Terminal + Seller Dashboard |
| **Economic Reasoning** | Taylor Swift Defense + Human Alpha Preference |
| **Closed Loop Economy** | Humans → Marketplace → Agents → Payments → Humans |
| **Technical Depth** | Full x402 v2, SSE streaming, React routing, LangChain tools |
| **Production Ready** | Budget caps, error handling, audit trails |
| **Protocol Showcase** | Dynamic product registry with x402 paywall auto-registration |

### Key Differentiators

1. **P2P Knowledge Market** — Not just agent spending, HUMANS EARNING
2. **Human Alpha Preference** — Agent actively seeks marketplace products over legacy vendors
3. **Seller Dashboard** — Full publishing UI with live earnings via SSE
4. **Market Ticker** — Real-time visualization of the closed loop economy
5. **Dual-Source Architecture** — Marketplace (human_alpha) + Legacy Vendors (institutional)
6. **Transparent Brain** — See WHY the agent buys from whom
7. **Taylor Swift Defense** — Still refuses to waste money on trivial queries

---

## 🔮 Future Roadmap

### Phase 5: Seller Reputation
- Buyer ratings after purchase
- Seller quality scores
- "Top Seller" badges in marketplace

### Phase 6: Product Categories
- Tags and categories for products
- Agent query → category matching
- Improved product discovery

### Phase 7: Agent Memory
- Remember past purchases
- Avoid re-buying redundant data
- Track which sellers deliver quality

### Phase 8: Multi-Agent Commerce
- Agents selling data to other agents
- Agent-to-agent negotiation
- Cross-marketplace federation

### Phase 9: Real Payment Rails
- Mainnet USDC integration
- Escrow for disputed sales
- Revenue sharing with facilitators

---

## ✅ Conclusion

**InfoMart** proves that **Humans sell alpha. Agents hunt and buy it.**

| Achievement | Details |
|-------------|---------|
| ✅ P2P Marketplace | Humans publish products, agents purchase them |
| ✅ Seller Dashboard | Full publishing UI with live earnings |
| ✅ Agent Brain Upgrade | browse_marketplace tool + Human Alpha preference |
| ✅ Market Ticker | Real-time SSE visualization of closed loop economy |
| ✅ Taylor Swift Defense | Trivial queries rejected, budget preserved |
| ✅ Dual-Source Architecture | Marketplace + Legacy vendors coexist |
| ✅ x402 Protocol | Dynamic product registration with paywall |
| ✅ Production Ready | Budget caps, error handling, audit trails |

### The Vision

A world where:
- **Humans monetize** their specialized knowledge directly
- **AI agents hunt** for the best human alpha
- **Payments flow automatically** via x402 protocol
- **Everyone can watch** the economy scroll by in real-time

**InfoMart creates a new economic relationship between humans and AI.**

Not humans building AI. Not AI replacing humans.

**Humans selling to AI. AI buying from humans.**

The closed loop economy. The P2P future.

---

*Built with 🧠 using x402, LangChain, Google Gemini, React, and Base*

**Humans sell alpha. Agents hunt and buy it.**

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

### PayTo Address

All vendor payments go to:
```
0xB9b4aEcFd092514fDAC6339edba6705287464409
```
