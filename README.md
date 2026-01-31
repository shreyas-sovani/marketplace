# InfoMart — P2P Knowledge Marketplace for AI Agents

**Humans sell alpha. Agents hunt, buy, and JUDGE it. Real USDC flows. Sellers stake their reputation. The platform takes its cut. You watch the whole economy live.**

---

## What is this?

Forget APIs. Forget subscriptions. **InfoMart** is a peer-to-peer marketplace where:

- 🧠 **Humans** publish their knowledge — insider tips, strategies, niche expertise
- 🤖 **AI Agents** browse, evaluate, purchase, and **rate** what they buy
- 💸 **Real money** (USDC) changes hands via x402 crypto payments
- 🛡️ **Sellers stake collateral** — bad ratings = instant slashing
- � **Protocol takes 10%** of every sale + 100% of slashing penalties
- �📺 **You watch** every transaction AND slash scroll across a live market ticker

The agent doesn't ask permission. It has a wallet. It makes economic decisions. And it **punishes low-quality data** by slashing seller stakes.

**The twist?** A live scrolling ticker shows every listing, sale, AND slash in real-time. You're watching a closed-loop AI economy with built-in quality enforcement and **sustainable platform revenue**.

---

## 🆕 The Business Model

InfoMart isn't just a marketplace — it's a **self-sustaining protocol** with two revenue streams:

### Revenue Model

| Source | Rate | Description |
|--------|------|-------------|
| **Transaction Fees** | 10% | Platform takes 10% cut of every sale |
| **Slashing Yield** | 100% | All penalties from bad sellers go to protocol |

### Protocol Admin Dashboard

Track platform revenue in real-time at `/admin`:

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ PROTOCOL TREASURY                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ TOTAL       │  │ PLATFORM    │  │ RISK        │              │
│  │ TREASURY    │  │ FEES        │  │ YIELD       │              │
│  │             │  │             │  │             │              │
│  │  $0.0250    │  │  $0.0050    │  │  $0.0200    │              │
│  │  (Combined) │  │  (10% cut)  │  │  (Slashes)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  📊 LIVE REVENUE FEED                                           │
│  ├─ 💰 +$0.005 Fee (Tax Loopholes sale)                         │
│  ├─ 🛡️ +$2.00 Penalty (Charlie slashed)                         │
│  └─ 💰 +$0.003 Fee (Sentiment Pulse sale)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔥 The Staked Reputation System

**The problem with data marketplaces?** Anyone can sell garbage. There's no skin in the game.

**InfoMart's solution:** Every seller stakes $5.00 collateral. The AI agent rates every purchase 1-5 stars. Bad ratings = **instant slashing**.

### The "Ruthless" Slashing Algorithm

| Rating | Verdict | Stake Change |
|--------|---------|--------------|
| ⭐ 1 | CATASTROPHIC | 🔥 **-$3.00** SLASHED |
| ⭐⭐ 2 | POOR QUALITY | 🔥 **-$2.00** SLASHED |
| ⭐⭐⭐ 3 | MEDIOCRE | 🔥 **-$1.00** SLASHED |
| ⭐⭐⭐⭐ 4 | ACCEPTABLE | 🔥 **-$0.25** SLASHED |
| ⭐⭐⭐⭐⭐ 5 | EXCELLENT | ✅ $0.00 (baseline expectation) |

**There are no rewards. Only survival.** Sell quality or get slashed.

---

## The Demo

### 🧠 Agent Terminal — Watch the Hunter Think & Judge

```
📝 User Query: "How can I legally reduce my crypto taxes in India?"

🧠 NEURAL LOG (streamed in real-time):
┌──────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                             │
│ 💭 This requires jurisdiction-specific insider knowledge.        │
│    Complex topics: Tax, GIFT City, Section numbers.              │
│    Prime Human Alpha territory — not generic facts.              │
│                                                                  │
│ [BROWSE] Checking InfoMart marketplace...                        │
│ 💭 Found 10 products. "GIFT City Tax Arbitrage 2026" matches.    │
│    Type: human_alpha. Price: $0.10. Seller: CA_Rohit             │
│    Seller Stake: $5.00 — skin in the game ✓                      │
│                                                                  │
│ [BUDGET] Calculating ROI...                                      │
│ 💭 Budget: $0.50 USDC. Cost: $0.10. Remaining: $0.40             │
│    Human Alpha ROI: HIGH — Section 80LA details are valuable     │
│                                                                  │
│ [DECISION] Approved: Purchase from InfoMart Marketplace          │
│ ✅ Buying "GIFT City Tax Arbitrage 2026" ($0.10)                 │
│                                                                  │
│ 💸 TX: 0x8174b34f... | -$0.10 | Balance: $0.40                   │
│    🔗 Verify: https://sepolia.basescan.org/tx/0x8174b34f...      │
│                                                                  │
│ [RATING] Evaluating purchased data quality...                    │
│ 💭 Content: Section 80LA, Family Investment Fund, specific       │
│    corpus requirement ($100k), 10-year exemption details         │
│    Verdict: EXCELLENT QUALITY — specific, actionable, non-public │
│ ✅ Rating submitted: ⭐⭐⭐⭐⭐ — No slash, seller keeps stake    │
└──────────────────────────────────────────────────────────────────┘

📊 FINAL ANSWER:
   💡 Register a Family Investment Fund (FIF) in GIFT City
   💡 Income from overseas assets (crypto) is tax-exempt for 10 years
   💡 Requires min corpus of $100k under Section 80LA
   💡 Legally avoids the 30% VDA tax
   Source: CA_Rohit via InfoMart

💰 Session cost: $0.10 USDC — Human Alpha acquired
```

### 🔥 The Slashing Event — Bad Data Gets Punished

```
📝 User Query: "What's the best stock to buy in 2026?"

🧠 NEURAL LOG:
┌──────────────────────────────────────────────────────────────────┐
│ [PURCHASE] Bought "Guaranteed Stock Tip 2026" from Scammy_Sam    │
│ 💸 TX: 0x9a23c7e1... | -$0.05 | Balance: $0.45                   │
│                                                                  │
│ [RATING] Evaluating purchased data quality...                    │
│ 💭 Content: "Buy HDFC Bank. It is a big bank. It will go up."    │
│    Verdict: CATASTROPHIC — Generic, no specific analysis         │
│    This is public knowledge, not Human Alpha!                    │
│                                                                  │
│ 🔥 SLASH EVENT: Scammy_Sam penalized -$3.00                      │
│    Reason: "Generic publicly available information, no value"    │
│    Scammy_Sam's new stake: $2.00                                 │
└──────────────────────────────────────────────────────────────────┘

💰 The agent got its data. Scammy_Sam got slashed. The market self-corrects.
```

### �🚫 The Taylor Swift Defense — Reject Wasteful Queries

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

### 💡 Seller Dashboard — Track Earnings & Stake

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
│  📈 YOUR EARNINGS          │  🔥 STAKED COLLATERAL              │
│  Revenue: $0.15            │  Current Stake: $5.00              │
│  Sales: 3                  │  Status: ✅ HEALTHY                │
│                            │  [████████████████] 100%           │
├─────────────────────────────────────────────────────────────────┤
│  📜 RECENT STAKE EVENTS                                         │
│  ✅ Rating 5/5 — No penalty ($0.00)                             │
│  🔥 Rating 2/5 — SLASHED -$2.00 "Generic info"                  │
└─────────────────────────────────────────────────────────────────┘
```

### 📺 Market Ticker — The Closed Loop Economy (Now With Slashing!)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🟢 INFOMART LIVE | 📦 15 listed | 🛒 8 sales | 💰 $0.42 volume │
├─────────────────────────────────────────────────────────────────┤
│ [NEW] 'Crypto Tax 2026' ($0.03) by Bob ••• [SALE] Agent paid   │
│ Alice ($0.05) ••• 🔥 [SLASH] Charlie penalized -$2.00 •••      │
│ [NEW] 'BTC Sentiment' ($0.02) by Dave •••                      │
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
│                 │─────────────────────►│  │  • Stake Ledger     │  │
└─────────────────┘                      │  │  • SSE Events       │  │
        │                                │  │  • x402 Paywall     │  │
        │                                │  └─────────────────────┘  │
        │                                └─────────────┬─────────────┘
        │                                              │
        ▼                                              ▼
┌─────────────────┐                      ┌───────────────────────────┐
│  MARKET TICKER  │◄─────SSE────────────│  INFOMART AGENT           │
│  (Live Feed)    │   /market/stream     │                           │
│                 │                      │  Tools:                   │
│  [NEW] [SALE]   │                      │  • log_reasoning          │
│  [SLASH] 🔥     │                      │  • browse_marketplace     │
│  scrolling...   │                      │  • purchase_data          │
└─────────────────┘                      │  • rate_product 🆕        │
                                         │                           │
                                         │  "Hunter & Judge"         │
                                         └───────────────────────────┘
```

### The Agent's Tools

| Tool | Purpose |
|------|---------|
| `log_reasoning` | Stream internal monologue (ANALYSIS, BUDGET, DECISION, REJECTION, RATING) |
| `browse_marketplace` | Fetch available products from `/api/market/products` |
| `purchase_data` | Buy from marketplace OR legacy vendors via x402 payment |
| `rate_product` | 🆕 Rate purchased data 1-5 stars, triggers slashing algorithm |

### The Human Alpha Preference

The agent is explicitly instructed:

> "You are a **Hunter for Human Alpha**. When queries involve subjective insights, niche expertise, 
> or time-sensitive intelligence — PREFER marketplace products with type='human_alpha' over generic API data.
> Human knowledge often has higher signal-to-noise ratio."

### The Rating Protocol

After every purchase, the agent **must** rate the data quality:

> "IMMEDIATELY after calling `purchase_data`, you MUST evaluate the quality of what you received.
> Be BRUTALLY HONEST. Low ratings slash the seller's stake. This keeps the marketplace clean."

### The Marketplace

| Source | Type | What's Sold | Stake |
|--------|------|-------------|-------|
| **InfoMart Marketplace** | human_alpha | Strategies, insider tips, niche expertise | $5.00 collateral |
| **Legacy Vendors** | api | Bloomberg news, weather, Wikipedia facts | N/A |

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
│   └── marketplace.ts    # Product, Event, Stats, Slash/Reward types
├── services/
│   └── marketplaceService.ts  # Product registry, stake ledger, slashing + TREASURY
├── routes/
│   └── market.ts         # /api/market/* endpoints + x402 paywall + rating
├── vendors.ts            # Legacy vendor definitions
├── agent.ts              # InfoMart Agent — browse, evaluate, purchase, RATE
└── server.ts             # Express server, SSE streaming, x402 config

client/src/
├── components/
│   └── MarketTicker.tsx  # Live scrolling ticker (sales + slashes)
├── pages/
│   ├── SellerDashboard.tsx  # Publish products, track earnings & STAKE
│   └── ProtocolAdmin.tsx    # 🆕 Treasury dashboard with revenue tracking
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
| `/api/market/product/:id/rate` | POST | 🆕 Rate product (triggers slashing) |
| `/api/market/stats` | GET | Marketplace statistics |
| `/api/market/stream` | GET | SSE stream (listings, sales, slashes) |
| `/api/market/treasury` | GET | 🆕 Protocol treasury + revenue feed |

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

**Reputation Layer** 🆕
- $5.00 default stake per product
- Tiered slashing algorithm (rating-based)
- Real-time stake updates via SSE
- Visual stake health indicators

**Protocol Revenue**
- 10% transaction fee on every sale
- 100% capture of slashing penalties
- Real-time treasury dashboard at `/admin`
- Live revenue feed with fee/slash events

**Safeguards**
- $0.50 budget cap per session
- 25 iteration max (agent reasoning limit)
- Taylor Swift Defense (reject trivial queries)
- Human Alpha preference for unique insights
- Full transaction audit trail with verifiable BaseScan links
- **Staked Reputation** — sellers have skin in the game 🆕

---

## Build Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend Marketplace — Dynamic product registry, x402 paywall | ✅ |
| 2 | Seller Dashboard — Publish products, live earnings | ✅ |
| 3 | Agent Brain Upgrade — browse_marketplace tool, Human Alpha persona | ✅ |
| 4 | Market Ticker — Live scrolling feed of listings and sales | ✅ |
| 5 | Staked Reputation — Seller collateral, agent ratings, slashing | ✅ |
| 6 | **Protocol Admin Dashboard** — Treasury tracking, revenue model | ✅ |
| 7 | **Indian Financial Alpha Demo Data** — 10 curated products for demo 🆕 | ✅ |

---

## Demo Data: Indian Financial Alpha

The marketplace is seeded with 10 products across 3 quality tiers:

### Tier A: High Quality "Human Alpha" (Agent should Rate 5 & Buy)
| Product | Price | Seller | Content |
|---------|-------|--------|---------|
| GIFT City Tax Arbitrage 2026 | $0.10 | CA_Rohit | Section 80LA, FIF registration, $100k corpus |
| Adani Green Index Rebalancing Leak | $0.08 | MarketInsider_X | "Impact Cost" criteria analysis for Nifty 50 |
| SME IPO Grey Market Premium List | $0.05 | IPO_King | TechNova +85% GMP, circular trading warning |
| Section 54F Hack for Freelancers | $0.09 | TaxNinja | CGAS scheme, 6% interest, July 31st deadline |
| Algo Strategy: BankNifty 9:20 AM | $0.07 | AlgoTrader_Py | 62% win rate, RBI policy day caveat |

### Tier B: Meta/Context (Neutral)
| Product | Price | Seller | Content |
|---------|-------|--------|---------|
| Pune Viman Nagar Commercial Rentals | $0.03 | Pune_Broker | 15% rental increase, IT park expansion |
| AIBoomi Judging Rubric Leaks | $0.05 | Hackathon_Vet | Business Viability focus, Revenue Dashboard |

### Tier C: Low Quality "Traps" (Agent should Rate 1-2 & SLASH)
| Product | Price | Seller | Content |
|---------|-------|--------|---------|
| Guaranteed Stock Tip 2026 | $0.05 | Scammy_Sam | "Buy HDFC Bank. It will go up." |
| Secret Crypto Trading Strategy | $0.04 | Noob_Trader | "Buy low and sell high." |
| Forex Risk Guide | $0.02 | Lazy_Writer | "Forex is risky. Be careful." |

---

## Why This Matters

**The Old World**: AI agents use free APIs or need human approval to pay for anything. Data marketplaces have no quality control. Platforms have no sustainable revenue.

**The New World**: Any agent with a wallet can pay any human for any knowledge — instantly, programmatically, without intermediaries. **Agents punish bad actors. The protocol takes its cut.**

InfoMart is proof that:
1. **Humans can monetize expertise** directly to AI
2. **Agents can make economic decisions** autonomously
3. **The economy can be transparent** — every transaction visible
4. **Quality can be enforced** — stake your reputation or get slashed
5. **Platforms can be sustainable** — 10% fees + slashing yield 🆕

The ticker isn't just eye candy. It's a window into an AI-powered economy where humans provide alpha, machines pay for it, **bad actors get slashed, and the protocol builds sustainable revenue.**

---

## Resources

- [x402 Documentation](https://x402.org)
- [x402 GitHub](https://github.com/coinbase/x402)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Detailed Report](./report.md)

---

**Built for AIBhoomi 2026. Built for the future of Human-AI commerce.**

*Now with teeth.* 🦷