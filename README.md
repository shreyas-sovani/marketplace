<p align="center">
  <img src="public/Inference Protocol logo.png" alt="Inference Protocol Logo" width="180"/>
</p>

# Inference Protocol- Data marketplace for AI agents to buy trading insights from traders.
It is a platform for monetizing financial intelligence. It enables experienced traders to sell niche, high-signal market insights directly to AI agents and traders.

---

## 💡Problem

Modern trading agents and retail traders rely on: Free data sources, hardcoded APIs, expensive enterprise terminals (Bloomberg)

This creates three major gaps:

### 1. Undermonetized Expertise
Skilled traders and analysts have no way to sell niche insights like short-term stock predictions, candlestick patterns, sentiment reads.

### 2. No On-Demand Insight Market
Retail and algo traders need fresh, contextual, short-horizon insights, and not static datasets or news feeds.

### 3. Fragmented Discovery
AI agents cannot easily discover or pay for specialized human knowledge, leading to missed opportunities in volatile markets.

---

## 💡 Solution

Inference Protocol is a **data marketplace designed for AI agents and traders**.

- Traders publish structured insights (predictions, analyses, datasets).
- AI agents autonomously search, evaluate, and purchase insights.
- Payments happen instantly via embedded micropayments (x402 + USDC).
- Buyers rate insights to build seller reputation.
- Sellers earn passive income without subscriptions or contracts.

This creates a **closed-loop economy** where quality data is rewarded and low-quality data is filtered out.

---
## 🧱 Project Structure

```
src/
├── types/
│   └── marketplace.ts    # Product, Event, Stats, Slash/Reward types
├── services/
│   └── marketplaceService.ts  # Product registry, stake ledger, slashing logic
├── routes/
│   └── market.ts         # /api/market/* endpoints + x402 paywall + rating
├── vendors.ts            # Legacy vendor definitions
├── agent.ts              # InfoMart Agent — browse, evaluate, purchase, RATE
└── server.ts             # Express server, SSE streaming, x402 config

client/src/
├── components/
│   └── MarketTicker.tsx  # Live scrolling ticker (sales + slashes)
├── pages/
│   └── SellerDashboard.tsx  # Publish products, track earnings & STAKE
└── App.tsx               # Agent Terminal, routing, budget display
```

---

## 🧱 Running it yourself

### Prerequisites
- Node.js 18+
- Wallet with testnet USDC on Base Sepolia
- Google AI API key (free at [aistudio.google.com](https://aistudio.google.com/apikey))

### Setup

```bash
git clone https://github.com/shreyas-sovani/Inference_protocol.git
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

## 🧱 Architecture Overview

- Seller Dashboard for publishing insights.
- Agent Interface for querying and purchasing.
- Marketplace Service for discovery and payments.
- Embedded x402 micropayment layer.
- Real-time updates via Server-Sent Events (SSE).

```
┌─────────────────┐                      ┌───────────────────────────┐
│  SELLER UI      │     POST /publish    │                           │
│  (Dashboard)    │─────────────────────►│     EXPRESS SERVER        │
│  Port 5173      │                      │     Port 4021             │
└─────────────────┘                      │                           │
                                         │  ┌─────────────────────┐  │
┌─────────────────┐     SSE /stream      │  │  MARKETPLACE        │  │
│  AGENT UI       │◄──────────────────── │  │  SERVICE            │  │
│  (Terminal)     │                      │  │                     │  │
│  Port 5173      │     POST /chat       │  │  • Product Registry │  │
│                 │─────────────────────►│  │  • Stake Ledger     │  │
└─────────────────┘                      │  │  • SSE Events       │  │
        │                                │  │  • x402 Paywall     │  │
        │                                │  └─────────────────────┘  │
        │                                └─────────────┬─────────────┘
        │                                              │
        ▼                                              ▼
┌─────────────────┐                      ┌───────────────────────────┐
│  MARKET TICKER  │◄─────SSE──────────── │  INFOMART AGENT           │
│  (Live Feed)    │   /market/stream     │                           │
│                 │                      │  Tools:                   │
│  [NEW] [SALE]   │                      │  • log_reasoning          │
│  [SLASH]        │                      │  • browse_marketplace     │
│  scrolling...   │                      │  • purchase_data          │
└─────────────────┘                      │  • rate_product           │
                                         │                           │
                                         │  "Hunter & Judge"         │
                                         └───────────────────────────┘
```
---

## 🛠 Tech Stack

### AI & Reasoning
- LangChain (agent orchestration)
- Google Gemini (reasoning & planning)
- Semantic search for discovery

### Payments
- x402 protocol (Coinbase standard)
- USDC stablecoin
- Base Sepolia testnet

### Backend
- Node.js + Express
- REST APIs
- Server-Sent Events (SSE)

### Frontend
- React 18
- Vite
- Tailwind CSS


---

## 💡 How It Works

### Seller Flow
Sign up with email and wallet address -> Upload insights (title, description, content) -> Set price per purchase -> Publish to the marketplace -> Track sales, earnings, and reputation via dashboard -> Withdraw earnings anytime

---

### Buyer Flow
Sign up with email and wallet address -> Enter a natural language query -> AI agent analyzes the request -> Agent searches marketplace using semantic matching -> Top insights are recommended -> Buyer approves instant micropayment -> Results are delivered in the interface -> Buyer rates the insight to build seller reputation

## 👥 Users

### Buyers
Indie traders building algo bots for NSE stocks, fintech startups using AI for predictions, enterprises automating strategies, individual investors seeking stock recommendations.

**Pain:** Lack of reliable, specialized, short-term market intelligence . 
**Willingness to Pay:** Traders already pay for tools, groups, and expert sessions.

---

### Sellers
Experienced retail traders, professional analysts, research firms and niche experts.

**Pain:** No easy way to monetize insights without high platform fees. 
**Incentive:** Free to list, earn per-use micropayments, passive income.


---
## API Endpoints

### Marketplace

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/market/publish` | POST | Publish a new product |
| `/api/market/products` | GET | List all products (public) |
| `/api/market/products/agent` | GET | Products formatted for LLM |
| `/api/market/product/:id` | GET | Single product listing |
| `/api/market/product/:id/buy` | GET |  Purchase (x402 paywall) |
| `/api/market/product/:id/record-sale` | POST | Record sale with txHash |
| `/api/market/product/:id/rate` | POST |  Rate product (triggers slashing) |
| `/api/market/stats` | GET | Marketplace statistics |
| `/api/market/stream` | GET | SSE stream (listings, sales, slashes) |

### Agent

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Trigger agent analysis |
| `/api/stream` | GET | Agent reasoning SSE stream |

---

##  💡 AI Impact & Responsible Use

### Evaluation & Guardrails (Hallucination / Bias Mitigations)

The core AI component is an autonomous agent powered by **LangChain** + **Google Gemini** (reasoning model) that interprets natural-language queries, performs semantic matching against listed insights, evaluates relevance & ROI, and decides whether to recommend or purchase content.

**Key mitigations in place:**
- Retrieval-Augmented Generation (RAG)-like pattern: agent reasoning is strictly grounded in retrieved marketplace items (no open-world hallucination allowed).
- Chain-of-thought prompting with explicit steps: Analysis → Browse → Budget/ROI → Decision → Rejection rules.
- Hard rejection for low-value / generic queries (e.g. "Who is Elon Musk?" or broad non-trading questions).
- Strict per-session budget cap ($0.10 USDC testnet default) prevents runaway spending.
- Post-purchase human ratings + reputation scoring + slashing mechanism disincentivize low-quality or misleading insights.
- No generative synthesis of financial predictions — agent only summarizes or forwards purchased human-created content.

## 💡 Known Limitations & Risks

- **Financial domain risk**: Insights are user-generated and not verified by the platform. Buyers (human or agent) must perform their own due diligence. The protocol is **not** investment advice.
- **Early-stage reputation system**: Reputation scores and slashing are new and may initially be noisy until enough ratings accumulate.
- **Model hallucinations**: While heavily mitigated via grounding + rejection rules, subtle misinterpretations of query intent or marketplace metadata remain possible.
- **Marketplace quality**: Low-quality or spammy listings can appear until filtered by ratings and economic incentives.

## 💖 Team

| Name              | Role                        | Contact            |
|-------------------|-----------------------------|--------------------------------|
| Shreyas Sovani    | Lead Developer    | [Shreyas Sovani](https://x.com/0xshreyaas) |
| Swanandi Bhende   | Product / UX Design         | [Swanandi Bhende](https://x.com/swanandibhende) |


---

