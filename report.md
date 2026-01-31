# 🧠 DueDiligence - Complete Technical Report

> **Project**: Just-in-Time Intelligence Platform with Transparent Brain  
> **Date**: January 30, 2026  
> **Protocol**: x402 v2 (Coinbase Open Payment Protocol)  
> **Network**: Base Sepolia Testnet (`eip155:84532`)  
> **Status**: ✅ **FULLY OPERATIONAL**  
> **Architecture**: SSE Streaming + React Neural Terminal UI

---

## 📋 Executive Summary

This report documents **DueDiligence** — an autonomous AI agent that makes real-time economic decisions about purchasing premium data. Unlike traditional chatbots, DueDiligence:

1. **Streams its internal reasoning** to a "Neural Terminal" UI via Server-Sent Events
2. **Rejects low-value queries** using the "Taylor Swift Defense"
3. **Argues with itself** about ROI before spending any money
4. **Pays vendors** via x402 protocol with full transaction transparency

**Key Innovation**: The "Transparent Brain" — every thought, budget calculation, and decision is streamed to the frontend in real-time. This isn't just a chatbot that happens to pay for data; it's an **auditable AI financial controller**.

---

## 🎯 The Problem We Solve

AI agents need access to diverse, specialized data sources. Current limitations:

| Problem | Traditional Approach | DueDiligence Solution |
|---------|---------------------|----------------------|
| **Black Box Decisions** | Agent buys data, user doesn't know why | Every thought streamed in real-time |
| **Overspending** | Agent spends on everything | Taylor Swift Defense rejects trivial queries |
| **No Accountability** | No audit trail | Full transaction ledger with reasoning |
| **Subscription Lock-in** | Pre-paid API keys | Pay-per-request via x402 |
| **Single Vendor** | Hardcoded to one source | Dynamic vendor marketplace |

---

## 🏗️ System Architecture

### The Transparent Brain Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     DUEDILIGENCE - TRANSPARENT BRAIN ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────┐         ┌────────────────────────────────────────┐  │
│  │   🖥️ NEURAL TERMINAL   │         │          🌐 EXPRESS SERVER             │  │
│  │   (React + Tailwind)   │         │          (Port 4021)                   │  │
│  │                        │         │                                        │  │
│  │  ┌──────────────────┐  │   SSE   │  ┌──────────────────────────────────┐  │  │
│  │  │ Budget Display   │◄─┼─────────┼──┤  GET /api/stream                 │  │  │
│  │  │ $0.10 ████░░ $0.08│  │  events │  │  • connected                     │  │  │
│  │  └──────────────────┘  │         │  │  • log (reasoning steps)         │  │  │
│  │                        │         │  │  • tx (transactions)             │  │  │
│  │  ┌──────────────────┐  │         │  │  • budget (balance updates)      │  │  │
│  │  │ Neural Log       │◄─┼─────────┼──┤  • answer (final response)       │  │  │
│  │  │ [ANALYSIS] ...   │  │         │  │  • error                         │  │  │
│  │  │ [BUDGET] ...     │  │         │  └──────────────────────────────────┘  │  │
│  │  │ [DECISION] ...   │  │         │                                        │  │
│  │  └──────────────────┘  │  POST   │  ┌──────────────────────────────────┐  │  │
│  │                        │─────────┼─►│  POST /api/chat                  │  │  │
│  │  ┌──────────────────┐  │  query  │  │  { query, session_id }           │  │  │
│  │  │ Transaction Log  │  │         │  └────────────────┬─────────────────┘  │  │
│  │  │ 💸 legal_in $0.02│  │         │                   │                    │  │
│  │  └──────────────────┘  │         │                   ▼                    │  │
│  │                        │         │  ┌──────────────────────────────────┐  │  │
│  │  Port 5173 (Vite)      │         │  │  🤖 DUEDILIGENCE AGENT           │  │  │
│  └────────────────────────┘         │  │                                  │  │  │
│                                     │  │  Tools:                          │  │  │
│                                     │  │  • log_reasoning (→ SSE log)     │  │  │
│                                     │  │  • purchase_data (→ SSE tx)      │  │  │
│                                     │  │                                  │  │  │
│                                     │  │  LangChain + Gemini Flash Lite   │  │  │
│                                     │  │  Temperature: 0.2                │  │  │
│                                     │  │  Max Iterations: 8               │  │  │
│                                     │  └────────────────┬─────────────────┘  │  │
│                                     │                   │                    │  │
│                                     │                   ▼                    │  │
│                                     │  ┌──────────────────────────────────┐  │  │
│                                     │  │  🏪 VENDOR MARKETPLACE           │  │  │
│                                     │  │                                  │  │  │
│                                     │  │  /api/vendor/legal_in    $0.02   │  │  │
│                                     │  │  /api/vendor/bloomberg   $0.05   │  │  │
│                                     │  │  /api/vendor/wiki        $0.01   │  │  │
│                                     │  │  /api/vendor/weather     $0.01   │  │  │
│                                     │  │  /api/vendor/sentiment   $0.02   │  │  │
│                                     │  │                                  │  │  │
│                                     │  │  x402 Paywall Protected          │  │  │
│                                     │  └──────────────────────────────────┘  │  │
│                                     └────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                           x402 PAYMENT FLOW                                 ││
│  │                                                                             ││
│  │   Agent Wallet ──► x402/fetch ──► Facilitator ──► Base Sepolia ──► Vendor  ││
│  │   (USDC)           (auto-sign)    (x402.org)     (settlement)    (paid)    ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏪 Vendor Marketplace

### The Simulated Economy

DueDiligence operates in a simulated marketplace with 5 vendors, each with different value ratings:

| Vendor | ID | Price | Value | Data Provided |
|--------|-----|-------|-------|---------------|
| **⚖️ LegalEdge India** | `legal_in` | $0.02 | HIGH | VDA 30% tax, TDS rules, FIU-IND compliance, WazirX precedent |
| **📰 Bloomberg Lite** | `bloomberg_lite` | $0.05 | HIGH | Breaking headlines, market moves, fear/greed index |
| **📚 WikiFacts Basic** | `wiki_basic` | $0.01 | LOW | General facts, entity summaries |
| **🌤️ WeatherNow Global** | `weather_global` | $0.01 | LOW | Real-time weather data worldwide |
| **📊 SentimentPulse X** | `x_sentiment` | $0.02 | MEDIUM | Twitter/X trending topics, sentiment analysis |

### Value Rating System

The agent considers value ratings when deciding which vendors to purchase:

- **HIGH**: Specialized, time-sensitive, jurisdiction-specific data
- **MEDIUM**: Useful context, but not critical
- **LOW**: General information, widely available

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
// Event types streamed to frontend
type SSEEvent = 
  | { type: 'log'; data: { step: string; thought: string; status: string; timestamp: string } }
  | { type: 'tx'; data: { vendor: string; amount: number; txHash: string; timestamp: string } }
  | { type: 'budget'; data: { total: number; spent: number; remaining: number } }
  | { type: 'answer'; data: { content: string; complete: boolean } }
  | { type: 'error'; data: { message: string; code: string } };
```

### Agent Tools

#### Tool 1: `log_reasoning`

Streams the agent's internal thoughts to the Neural Terminal:

```typescript
const logReasoningTool = tool(
  async ({ step, thought, status }) => {
    // Emit SSE event to connected client
    emitToSession(sessionId, {
      type: 'log',
      data: { step, thought, status, timestamp: new Date().toISOString() }
    });
    return `Logged: [${step}] ${thought}`;
  },
  {
    name: 'log_reasoning',
    description: 'Log your internal reasoning process',
    schema: z.object({
      step: z.enum(['ANALYSIS', 'BUDGET', 'DECISION', 'REJECTION']),
      thought: z.string(),
      status: z.enum(['Thinking', 'Approved', 'Rejected']),
    }),
  }
);
```

#### Tool 2: `purchase_data`

Buys vendor data via x402 and streams the transaction:

```typescript
const purchaseDataTool = tool(
  async ({ vendor_id, reason }) => {
    const vendor = getVendorById(vendor_id);
    
    // Check budget
    if (session.spent + vendor.cost > session.budget) {
      return 'BUDGET_EXCEEDED: Cannot afford this vendor';
    }
    
    // Make x402 payment
    const response = await fetchWithPayment(`${SERVER_URL}/api/vendor/${vendor_id}`);
    const data = await response.json();
    
    // Update session and emit events
    session.spent += vendor.cost;
    emitToSession(sessionId, { type: 'tx', data: { vendor: vendor.name, amount: vendor.cost, ... } });
    emitToSession(sessionId, { type: 'budget', data: { total: 0.10, spent: session.spent, ... } });
    
    return JSON.stringify(data);
  },
  {
    name: 'purchase_data',
    schema: z.object({
      vendor_id: z.enum(['legal_in', 'bloomberg_lite', 'wiki_basic', 'weather_global', 'x_sentiment']),
      reason: z.string(),
    }),
  }
);
```

### x402 v2 Compliance

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| CAIP-2 Network ID | `eip155:84532` (Base Sepolia) | ✅ |
| Scoped Packages | `@x402/express`, `@x402/fetch`, `@x402/evm`, `@x402/core` | ✅ |
| Payment Scheme | `exact` (ExactEvmScheme) | ✅ |
| Facilitator | `https://x402.org/facilitator` | ✅ |
| Multi-Route Paywall | 5 independent vendor routes | ✅ |
| Dynamic Pricing | Per-vendor pricing from registry | ✅ |

---

## 🖥️ Neural Terminal UI

### React Component Architecture

```
App.tsx
├── BudgetDisplay        # Progress bar showing spent/remaining
├── StatusBadge          # Connected/Processing/Error states  
├── StepIcon             # ANALYSIS/BUDGET/DECISION/REJECTION icons
├── LogEntryComponent    # Individual reasoning step display
├── TransactionComponent # Payment transaction display
└── QuickTestButtons     # Pre-built test queries
```

### SSE Connection Pattern

```typescript
const connectSSE = (sessionId: string) => {
  const es = new EventSource(`/api/stream?session_id=${sessionId}`);
  
  es.addEventListener('log', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    setLogs(prev => [...prev, data]);
  });
  
  es.addEventListener('tx', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    setTransactions(prev => [...prev, data]);
  });
  
  es.addEventListener('budget', (e: MessageEvent) => {
    setBudget(JSON.parse(e.data));
  });
  
  // ... more event handlers
};
```

### Tailwind Neural Theme

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        neural: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          accent: '#10b981',  // Green for success
          warning: '#f59e0b', // Amber for caution
          error: '#ef4444',   // Red for errors
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
      }
    }
  }
};
```

---

## 📊 Demo Scenarios

### Scenario 1: Smart Query (Approved)

```
📝 Query: "What are the crypto tax regulations in India?"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                    Thinking│
│ 💭 This is a jurisdiction-specific regulatory question.         │
│    Requires specialized legal expertise. High value query.      │
│                                                                 │
│ [BUDGET] Checking funds and ROI...                     Thinking │
│ 💭 Budget: $0.10. LegalEdge India costs $0.02.                  │
│    Value rating: HIGH. ROI assessment: APPROVED.                │
│                                                                 │
│ [DECISION] Purchase approved                           Approved │
│ 💭 Proceeding to purchase legal_in vendor data.                 │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions:
┌─────────────────────────────────────────────────────────────────┐
│ LegalEdge India    -$0.02    TX: 0xa1b2c3d4...    ✅ Success   │
└─────────────────────────────────────────────────────────────────┘

💰 Final Budget: $0.08 remaining ($0.02 spent)
```

### Scenario 2: Trivial Query (Rejected)

```
📝 Query: "What is 2+2?"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                    Thinking│
│ 💭 This is basic arithmetic. A calculator can answer this.      │
│    No premium data source adds value here.                      │
│                                                                 │
│ [REJECTION] Taylor Swift Defense activated             Rejected │
│ 💭 This query does not require paid intelligence.               │
│    Answer: 2 + 2 = 4. Budget preserved for valuable queries.    │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions: (none)

💰 Final Budget: $0.10 remaining ($0.00 spent) — STINGY MODE
```

### Scenario 3: Multi-Vendor Query

```
📝 Query: "Give me India crypto news, sentiment, and legal status"

🧠 Neural Log:
┌─────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Multi-aspect query detected...               Thinking│
│ 💭 User needs: (1) News, (2) Sentiment, (3) Legal status.       │
│    This requires 3 different vendor specializations.            │
│                                                                 │
│ [BUDGET] Calculating multi-vendor cost...              Thinking │
│ 💭 legal_in: $0.02 + bloomberg_lite: $0.05 + x_sentiment: $0.02 │
│    Total: $0.09. Budget: $0.10. Affordable ✅                   │
│                                                                 │
│ [DECISION] Multi-vendor purchase approved              Approved │
│ 💭 Purchasing from 3 vendors for comprehensive coverage.        │
└─────────────────────────────────────────────────────────────────┘

💸 Transactions:
┌─────────────────────────────────────────────────────────────────┐
│ LegalEdge India    -$0.02    TX: 0xa1b2...    ✅ Success        │
│ Bloomberg Lite     -$0.05    TX: 0xc3d4...    ✅ Success        │
│ SentimentPulse X   -$0.02    TX: 0xe5f6...    ✅ Success        │
└─────────────────────────────────────────────────────────────────┘

💰 Final Budget: $0.01 remaining ($0.09 spent)
```

---

## 🛡️ Production Safeguards

### Budget Protection

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Session Budget | $0.10 USDC | Hard spending cap per session |
| Per-purchase check | Real-time | Reject if would exceed budget |
| Taylor Swift Defense | Query filter | Reject trivial queries |

### Rate Limiting

| Safeguard | Value | Purpose |
|-----------|-------|---------|
| Max Iterations | 8 | Prevent infinite agent loops |
| Min Delay | 1000ms | Respect API rate limits |

### Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Vendor unavailable | HTTP error | Skip, continue with others |
| Payment failed | x402 error | Retry once, then report |
| Budget exceeded | Cost check | Reject, explain to user |
| SSE disconnect | Connection close | Clean up session |

---

## 📁 Project Structure

```
agentpay-insights/
├── src/
│   ├── vendors.ts         # 🏪 Vendor registry (5 vendors)
│   │                       #   - Prices, value ratings, mock data
│   │                       #   - getVendorById(), getVendorSummary()
│   │
│   ├── agent.ts           # 🤖 DueDiligence Agent
│   │                       #   - System prompt with Taylor Swift Defense
│   │                       #   - log_reasoning tool
│   │                       #   - purchase_data tool
│   │                       #   - runDueDiligenceAgent()
│   │
│   └── server.ts          # 🌐 Express Server
│                           #   - SSE streaming (/api/stream)
│                           #   - Chat endpoint (/api/chat)
│                           #   - x402 paywall (vendor routes)
│                           #   - SPA fallback
│
├── client/
│   ├── src/
│   │   ├── App.tsx        # 🖥️ Neural Terminal UI
│   │   │                   #   - BudgetDisplay component
│   │   │                   #   - LogEntryComponent
│   │   │                   #   - TransactionComponent
│   │   │                   #   - SSE connection logic
│   │   │
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Tailwind + custom animations
│   │
│   ├── vite.config.ts     # Vite config (proxy to :4021)
│   └── tailwind.config.js # Neural theme colors
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
| **Innovation** | First "Transparent Brain" AI — streams reasoning in real-time |
| **User Experience** | Neural Terminal UI shows every thought before money moves |
| **Economic Reasoning** | Taylor Swift Defense rejects trivial queries |
| **Technical Depth** | Full x402 v2, SSE streaming, React UI, LangChain tools |
| **Production Ready** | Budget caps, error handling, audit trails |
| **Protocol Showcase** | Multi-route paywall, dynamic vendor discovery |

### Key Differentiators

1. **Transparent Brain** — See WHY the agent spends, not just WHAT it bought
2. **Taylor Swift Defense** — Agent refuses to waste money on trivial queries
3. **Real-time SSE** — Native HTTP streaming (no Socket.io bloat)
4. **Neural Terminal** — Beautiful UI that makes AI decisions understandable
5. **Audit Trail** — Every reasoning step logged for accountability

---

## 🔮 Future Roadmap

### Phase 2: Production Vendors
- Connect to real APIs (not simulated data)
- Dynamic pricing based on market rates
- Vendor reputation scores

### Phase 3: Agent Policies
- User-configurable spending limits
- Vendor blacklist/whitelist
- Query category restrictions

### Phase 4: Agent Memory
- Remember past purchases
- Avoid re-buying redundant data
- Learn vendor quality over time

### Phase 5: Multi-Agent Commerce
- Agents selling data to other agents
- Negotiation protocols
- Reputation systems

---

## ✅ Conclusion

**DueDiligence** proves that autonomous AI agents can be both **economically efficient** and **transparently accountable**.

| Achievement | Details |
|-------------|---------|
| ✅ Transparent Brain | Every reasoning step streamed to UI |
| ✅ Taylor Swift Defense | Trivial queries rejected, budget preserved |
| ✅ Multi-Vendor Marketplace | 5 vendors with different specializations |
| ✅ Real-time SSE | Native HTTP streaming to React frontend |
| ✅ x402 Protocol | Full v2 implementation with multi-route paywall |
| ✅ Production Ready | Budget caps, error handling, audit trails |

### The Vision

A world where AI agents can spend money autonomously — but humans can always see:
- **WHY** the agent decided to spend
- **WHAT** it considered before spending
- **HOW MUCH** it spent and on what
- **WHEN** it chose NOT to spend

**DueDiligence makes that world possible today.**

---

*Built with 🧠 using x402, LangChain, Google Gemini, React, and Base*

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
