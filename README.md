# DueDiligence — Just-in-Time Intelligence Platform

**An AI agent with a Transparent Brain. It argues with itself about costs, rejects low-value queries, and pays for data — while you watch it think.**

---

## What is this?

Imagine you're launching a crypto trading app in India. You need:
- Regulatory requirements (VDA tax laws, FIU compliance)
- Market sentiment (what's trending, bullish or bearish?)
- Recent news (any breaking developments?)

Free sources are garbage — outdated, unreliable, conflicting. Premium APIs have what you need, but they cost money.

**DueDiligence** is an AI agent that:
1. **Argues with itself** about whether your query is worth paying for
2. **Rejects low-value queries** (the "Taylor Swift Defense" — if it's on Wikipedia, you don't need us)
3. **Discovers** available data vendors in a marketplace
4. **Evaluates** ROI before spending a single cent
5. **Pays** for exactly what it needs via x402 crypto payments
6. **Streams its thinking** to your browser in real-time

No human approves the payments. The agent has a crypto wallet and makes its own economic decisions.

**The twist?** You can watch its entire internal monologue. Every doubt, every calculation, every decision — streamed live to a "Neural Terminal" UI.

---

## The Demo

```
📝 User Query: "What are the crypto tax regulations in India?"

🧠 NEURAL LOG (streamed in real-time):
┌──────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                             │
│ 💭 This asks about specific regulatory information that requires │
│    jurisdiction-specific expertise. Not generic trivia.          │
│                                                                  │
│ [BUDGET] Checking available funds...                             │
│ 💭 Budget: $0.10 USDC. Legal data costs $0.02.                   │
│    ROI Assessment: HIGH - regulatory info is time-sensitive      │
│                                                                  │
│ [DECISION] Approved: Purchase from LegalEdge India               │
│ ✅ Paying $0.02 for legal_in vendor data                         │
│                                                                  │
│ 💸 TX: 0x8174b34f... | -$0.02 | Balance: $0.08                   │
└──────────────────────────────────────────────────────────────────┘

📊 FINAL ANSWER:
   📜 VDA Tax: 30% on all crypto transactions
   📜 TDS: 1% on transfers above ₹10,000  
   📜 FIU-IND registration mandatory for exchanges
   📜 Recent: WazirX vs ED case setting precedents

💰 Session cost: $0.02 USDC (1 vendor)
```

But try asking "What is 2+2?" and watch:

```
🧠 NEURAL LOG:
┌──────────────────────────────────────────────────────────────────┐
│ [ANALYSIS] Evaluating query value...                             │
│ 💭 This is basic arithmetic. A calculator can answer this.       │
│    No premium data source can add value here.                    │
│                                                                  │
│ [REJECTION] Query rejected under Taylor Swift Defense            │
│ ❌ This query does not require paid intelligence sources.        │
│    Answer: 2 + 2 = 4. Budget preserved.                          │
└──────────────────────────────────────────────────────────────────┘

💰 Session cost: $0.00 USDC (0 vendors) — STINGY MODE ACTIVATED
```

Real USDC. Real blockchain transactions. Real accountability.

---

## How it works

### The Architecture

```
┌─────────────────┐     SSE Stream      ┌───────────────────┐
│  React UI       │◄───────────────────│  Express Server   │
│  (Neural        │     /api/stream     │                   │
│   Terminal)     │                     │  x402 Paywall     │
│                 │────────────────────►│                   │
│  Port 5173      │    POST /api/chat   │  Port 4021        │
└─────────────────┘                     └─────────┬─────────┘
                                                  │
                                                  ▼
                                        ┌───────────────────┐
                                        │  DueDiligence     │
                                        │  Agent            │
                                        │                   │
                                        │  • log_reasoning  │
                                        │  • purchase_data  │
                                        │                   │
                                        │  LangChain +      │
                                        │  Gemini Flash     │
                                        └─────────┬─────────┘
                                                  │
                                                  ▼
                                        ┌───────────────────┐
                                        │  Vendor           │
                                        │  Marketplace      │
                                        │                   │
                                        │  5 vendors        │
                                        │  x402 protected   │
                                        └───────────────────┘
```

### The Transparent Brain (SSE Events)

Every thought is streamed as a Server-Sent Event:

| Event | Purpose |
|-------|---------|
| `log` | Agent's internal reasoning (step, thought, status) |
| `tx` | Payment transaction (vendor, amount, txHash) |
| `budget` | Real-time budget update (spent, remaining) |
| `answer` | Final synthesized response |
| `error` | Something went wrong |

### The Taylor Swift Defense

The agent has explicit instructions to reject queries that don't need premium data:

> "If a query could be answered by a quick Google search, a calculator, or common knowledge, 
> politely decline and explain that this is a premium intelligence service, not a general assistant.
> Examples of REJECTIONS: 'What is 2+2?', 'Who is Taylor Swift?', 'What color is the sky?'"

### The Vendor Marketplace

| Vendor | Price | Value | Data |
|--------|-------|-------|------|
| LegalEdge India | $0.02 | HIGH | VDA tax (30%), TDS rules, FIU compliance |
| Bloomberg Lite | $0.05 | HIGH | Breaking news, market moves, fear/greed index |
| WikiFacts Basic | $0.01 | LOW | General facts, entity info |
| WeatherNow Global | $0.01 | LOW | Weather data worldwide |
| SentimentPulse X | $0.02 | MEDIUM | Twitter/X sentiment analysis |

The agent uses the [x402 protocol](https://x402.org) — payments embedded directly in HTTP requests.

---

## Running it yourself

### Prerequisites
- Node.js 18+
- A wallet with testnet USDC on Base Sepolia
- Google AI API key (free at [aistudio.google.com](https://aistudio.google.com/apikey))

### Setup

```bash
cd agentpay-insights
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

### Run the platform

**Terminal 1** — Start the backend:
```bash
npm run start:server
```

**Terminal 2** — Start the frontend:
```bash
cd client && npm run dev
```

Open `http://localhost:5173` and watch the agent think in real-time.

---

## Project structure

```
src/
├── vendors.ts   # 5 vendor definitions with prices & data
├── agent.ts     # DueDiligence agent with LangChain tools
│                # - log_reasoning: Stream internal thoughts  
│                # - purchase_data: Buy vendor data via x402
└── server.ts    # Express server with SSE streaming
                 # - /api/stream: Real-time event stream
                 # - /api/chat: Trigger agent analysis
                 # - /api/vendor/:id: x402 paywalled endpoints

client/
├── src/
│   └── App.tsx  # Neural Terminal React UI
│                # - Budget display with progress bar
│                # - Real-time log viewer
│                # - Transaction ledger
│                # - Quick test buttons
└── ...          # Vite + Tailwind config
```

---

## The tech stack

**AI Layer**
- LangChain for tool orchestration
- Google Gemini 2.5 Flash Lite for reasoning
- Zod for schema validation

**Payment Layer**
- x402 v2 protocol (Coinbase standard)
- Base Sepolia testnet
- USDC stablecoin

**Real-time Layer**
- Server-Sent Events (native HTTP, no Socket.io)
- React 18 + Vite 5
- Tailwind CSS (Neural Terminal theme)

**Safeguards**
- $0.10 budget cap per session
- 8 iteration max (agent reasoning limit)
- Taylor Swift Defense (reject trivial queries)
- Transaction audit trail

---

## Why this matters

Today, AI agents are limited to free APIs or require human approval for payments. That doesn't scale.

With x402, any agent with a wallet can pay for any resource on the internet — instantly, programmatically, without subscriptions or API keys.

**But transparency matters too.** If an AI is spending money on your behalf, you should be able to see:
- WHY it decided to spend
- WHAT it considered before spending  
- HOW MUCH it spent and on what
- WHEN it chose NOT to spend

DueDiligence gives you that visibility. The Neural Terminal isn't just a UI — it's an audit log for autonomous AI decisions.

---

## Resources

- [x402 Documentation](https://x402.org)
- [x402 GitHub](https://github.com/coinbase/x402)
- [Base Sepolia Explorer](https://sepolia.basescan.org) (verify your transactions)
- [Detailed Report](./report.md) (technical deep-dive)

---

Built for a hackathon. Built for the future of accountable AI.
# marketplace
