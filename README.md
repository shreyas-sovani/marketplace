# InfoMart — P2P Knowledge Marketplace for AI Agents

**Humans sell alpha. Agents hunt and buy it. Real USDC flows. You watch the whole economy live.**

---

## What is this?

Forget APIs. Forget subscriptions. **InfoMart** is a peer-to-peer marketplace where:

- 🧠 **Humans** publish their knowledge — insider tips, strategies, niche expertise
- 🤖 **AI Agents** browse, evaluate, and purchase what they need
- 💸 **Real money** (USDC) changes hands via x402 crypto payments
- 📺 **You watch** every transaction scroll across a live market ticker

The agent doesn't ask permission. It has a wallet. It makes economic decisions. And it prefers **Human Alpha** — unique insights that APIs can't provide.

**The twist?** A live scrolling ticker shows every listing and every sale in real-time. You're watching a closed-loop AI economy running on actual blockchain rails.

---

## The Demo

### 🧠 Agent Terminal — Watch the Hunter Think

```
📝 User Query: "What strategies do Indian traders use to minimize crypto taxes?"

🧠 NEURAL LOG (streamed in real-time):
┌──────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                             │
│ 💭 This requires jurisdiction-specific insider knowledge.        │
│    Not generic facts — this is prime Human Alpha territory.      │
│                                                                  │
│ [BROWSE] Checking InfoMart marketplace...                        │
│ 💭 Found 3 products. "India Crypto Tax Loopholes 2026" matches.  │
│    Type: human_alpha. Price: $0.03. Seller: Bob (Tax Expert)     │
│                                                                  │
│ [BUDGET] Calculating ROI...                                      │
│ 💭 Budget: $0.50 USDC. Cost: $0.03. Remaining: $0.47             │
│    Human Alpha ROI: HIGH — insider tax strategies are valuable   │
│                                                                  │
│ [DECISION] Approved: Purchase from InfoMart Marketplace          │
│ ✅ Buying "India Crypto Tax Loopholes 2026" ($0.03)              │
│                                                                  │
│ 💸 TX: 0x8174b34f... | -$0.03 | Balance: $0.47                   │
│    🔗 Verify: https://sepolia.basescan.org/tx/0x8174b34f...      │
└──────────────────────────────────────────────────────────────────┘

📊 FINAL ANSWER:
   � GIFT City exemption: Route through IFSC for 0% TDS
   💡 NFT Gifting strategy: Transfer to relatives tax-free
   � DeFi staking as "interest income" (slab rate, not 30%)
   Source: Bob (Crypto Tax Expert) via InfoMart

💰 Session cost: $0.03 USDC — Human Alpha acquired
```

### 🚫 The Taylor Swift Defense — Reject Wasteful Queries

```
📝 User Query: "Who is Taylor Swift?"

🧠 NEURAL LOG:
┌──────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                             │
│ 💭 General knowledge. Wikipedia has this. Zero ROI.              │
│                                                                  │
│ [REJECTION] Query rejected — Taylor Swift Defense                │
│ ❌ No data source adds value here. Answering from own knowledge. │
└──────────────────────────────────────────────────────────────────┘

💰 Session cost: $0.00 USDC — MISER MODE ACTIVATED
```

### 💡 Seller Dashboard — Publish Your Knowledge

```
┌─────────────────────────────────────────────────────────────────┐
│  📦 PUBLISH YOUR KNOWLEDGE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Title: "AIBhoomi Winning Strategy 2026"                        │
│  Description: Insider tips from a 3x hackathon winner...        │
│  Price: [$0.05] ◀────────────●─────────────▶ ($0.01 - $0.10)    │
│  Type: [🧠 Human Alpha ▼]                                       │
│  Wallet: 0xYourWallet...                                        │
│                                                                 │
│  [🚀 PUBLISH TO INFOMART]                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  📈 YOUR EARNINGS                                               │
│  Published: 1 product | Sales: 3 | Revenue: $0.15               │
└─────────────────────────────────────────────────────────────────┘
```

### 📺 Market Ticker — The Closed Loop Economy

```
┌─────────────────────────────────────────────────────────────────┐
│ 🟢 INFOMART LIVE | 📦 15 listed | 🛒 8 sales | 💰 $0.42 volume │
├─────────────────────────────────────────────────────────────────┤
│ [NEW] 'Crypto Tax 2026' ($0.03) by Bob ••• [SALE] Agent paid   │
│ Alice ($0.05) ••• [NEW] 'BTC Sentiment' ($0.02) by Charlie ••• │
└─────────────────────────────────────────────────────────────────┘
                         ◀─── scrolling marquee ───▶
```

---

## How it works

### The Architecture

```
┌─────────────────┐                      ┌───────────────────────────┐
│  SELLER UI      │     POST /publish    │                           │
│  (Dashboard)    │─────────────────────►│     EXPRESS SERVER        │
│  Port 5173      │                      │     Port 4021             │
└─────────────────┘                      │                           │
                                         │  ┌─────────────────────┐  │
┌─────────────────┐     SSE /stream      │  │  MARKETPLACE        │  │
│  AGENT UI       │◄────────────────────│  │  SERVICE            │  │
│  (Terminal)     │                      │  │                     │  │
│  Port 5173      │     POST /chat       │  │  • Product Registry │  │
│                 │─────────────────────►│  │  • SSE Events       │  │
└─────────────────┘                      │  │  • x402 Paywall     │  │
        │                                │  └─────────────────────┘  │
        │                                └─────────────┬─────────────┘
        │                                              │
        ▼                                              ▼
┌─────────────────┐                      ┌───────────────────────────┐
│  MARKET TICKER  │◄─────SSE────────────│  INFOMART AGENT           │
│  (Live Feed)    │   /market/stream     │                           │
│                 │                      │  Tools:                   │
│  [NEW] [SALE]   │                      │  • log_reasoning          │
│  scrolling...   │                      │  • browse_marketplace     │
└─────────────────┘                      │  • purchase_data          │
                                         │                           │
                                         │  "Hunter for Human Alpha" │
                                         └───────────────────────────┘
```

### The Agent's Tools

| Tool | Purpose |
|------|---------|
| `log_reasoning` | Stream internal monologue (ANALYSIS, BUDGET, DECISION, REJECTION) |
| `browse_marketplace` | Fetch available products from `/api/market/products` |
| `purchase_data` | Buy from marketplace OR legacy vendors via x402 payment |

### The Human Alpha Preference

The agent is explicitly instructed:

> "You are a **Hunter for Human Alpha**. When queries involve subjective insights, niche expertise, 
> or time-sensitive intelligence — PREFER marketplace products with type='human_alpha' over generic API data.
> Human knowledge often has higher signal-to-noise ratio."

### The Marketplace

| Source | Type | What's Sold |
|--------|------|-------------|
| **InfoMart Marketplace** | human_alpha | Strategies, insider tips, niche expertise |
| **Legacy Vendors** | api | Bloomberg news, weather, Wikipedia facts |

All purchases protected by [x402 protocol](https://x402.org) — payments embedded in HTTP requests.

---

## Running it yourself

### Prerequisites
- Node.js 18+
- Wallet with testnet USDC on Base Sepolia
- Google AI API key (free at [aistudio.google.com](https://aistudio.google.com/apikey))

### Setup

```bash
git clone https://github.com/shreyas-sovani/marketplace.git
cd marketplace
npm install
cd client && npm install && cd ..
cp .env.example .env
```

Add your keys to `.env`:
```
AGENT_PRIVATE_KEY=0x...     # Your wallet's private key
GOOGLE_API_KEY=...          # From Google AI Studio
```

### Get testnet tokens
- ETH for gas: [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)  
- USDC for payments: [Circle Faucet](https://faucet.circle.com/) (select Base Sepolia)

### Run

**Terminal 1** — Backend:
```bash
npm run start:server
```

**Terminal 2** — Frontend:
```bash
cd client && npm run dev
```

Open `http://localhost:5173`:
- **Agent Terminal** — Ask questions, watch the agent hunt for alpha
- **Sell Knowledge** — Publish your own expertise to the marketplace

---

## Project Structure

```
src/
├── types/
│   └── marketplace.ts    # Product, Event, Stats types
├── services/
│   └── marketplaceService.ts  # In-memory product registry, SSE events
├── routes/
│   └── market.ts         # /api/market/* endpoints + x402 paywall
├── vendors.ts            # Legacy vendor definitions
├── agent.ts              # InfoMart Agent — browse, evaluate, purchase
└── server.ts             # Express server, SSE streaming, x402 config

client/src/
├── components/
│   └── MarketTicker.tsx  # Live scrolling ticker (SSE-powered)
├── pages/
│   └── SellerDashboard.tsx  # Publish products, track earnings
└── App.tsx               # Agent Terminal, routing, budget display
```

---

## API Endpoints

### Marketplace

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/market/publish` | POST | Publish a new product |
| `/api/market/products` | GET | List all products (public) |
| `/api/market/products/agent` | GET | Products formatted for LLM |
| `/api/market/product/:id` | GET | Single product listing |
| `/api/market/product/:id/buy` | GET | 🔒 Purchase (x402 paywall) |
| `/api/market/product/:id/record-sale` | POST | Record sale with txHash |
| `/api/market/stats` | GET | Marketplace statistics |
| `/api/market/stream` | GET | SSE stream (listings, sales) |

### Agent

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Trigger agent analysis |
| `/api/stream` | GET | Agent reasoning SSE stream |

---

## The Tech Stack

**AI Layer**
- LangChain for tool orchestration
- Google Gemini 2.5 Flash for reasoning
- Zod for schema validation

**Payment Layer**
- x402 v2 protocol (Coinbase standard)
- Base Sepolia testnet
- USDC stablecoin

**Real-time Layer**
- Server-Sent Events (native HTTP)
- React 18 + Vite 5
- Tailwind CSS (dark terminal theme)

**Safeguards**
- $0.50 budget cap per session
- 30 iteration max (agent reasoning limit)
- Taylor Swift Defense (reject trivial queries)
- Human Alpha preference for unique insights
- Full transaction audit trail with verifiable BaseScan links

---

## Build Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend Marketplace — Dynamic product registry, x402 paywall | ✅ |
| 2 | Seller Dashboard — Publish products, live earnings | ✅ |
| 3 | Agent Brain Upgrade — browse_marketplace tool, Human Alpha persona | ✅ |
| 4 | Market Ticker — Live scrolling feed of listings and sales | ✅ |

---

## Why This Matters

**The Old World**: AI agents use free APIs or need human approval to pay for anything.

**The New World**: Any agent with a wallet can pay any human for any knowledge — instantly, programmatically, without intermediaries.

InfoMart is proof that:
1. **Humans can monetize expertise** directly to AI (no platform cut)
2. **Agents can make economic decisions** autonomously
3. **The economy can be transparent** — every transaction visible

The ticker isn't just eye candy. It's a window into an AI-powered economy where humans provide alpha and machines pay for it.

---

## Resources

- [x402 Documentation](https://x402.org)
- [x402 GitHub](https://github.com/coinbase/x402)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Detailed Report](./report.md)

---

**Built for AIBhoomi 2026. Built for the future of Human-AI commerce.**
