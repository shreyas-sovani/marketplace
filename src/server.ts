import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { runDueDiligenceAgent, type SSEEvent, type SessionState, createSession, CONFIG as AGENT_CONFIG } from './agent.js';
import { VENDOR_REGISTRY, getVendorById, getVendorSummary } from './vendors.js';
import marketRoutes, { generateMarketplaceRouteConfig, initializeRouteConfig } from './routes/market.js';
import { getAllProductListings } from './services/marketplaceService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const PORT = process.env.PORT || 4021;
const PAYTO_ADDRESS = '0xB9b4aEcFd092514fDAC6339edba6705287464409';
const NETWORK = 'eip155:84532' as const;
const FACILITATOR_URL = 'https://x402.org/facilitator';

// State
interface ServerState {
  sessions: Map<string, SessionState>;
  sseClients: Map<string, Response>;
  totalRevenue: number;
  totalTransactions: number;
}

const state: ServerState = {
  sessions: new Map(),
  sseClients: new Map(),
  totalRevenue: 0,
  totalTransactions: 0,
};

// x402 Setup
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const x402Server = new x402ResourceServer(facilitatorClient).register(NETWORK, new ExactEvmScheme());

// Route Config for x402 - Legacy Vendors (static)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const routeConfig: any = {};
for (const vendor of VENDOR_REGISTRY) {
  routeConfig[`GET /api/vendor/${vendor.id}`] = {
    accepts: [{ scheme: 'exact', network: NETWORK, price: `$${vendor.cost.toFixed(2)}`, payTo: PAYTO_ADDRESS }],
    description: vendor.description,
  };
}

// Route Config for x402 - InfoMart Marketplace Products (initial seed)
const marketplaceRouteConfig = generateMarketplaceRouteConfig(PAYTO_ADDRESS, NETWORK);
Object.assign(routeConfig, marketplaceRouteConfig);

// Export for dynamic route registration
export { routeConfig, PAYTO_ADDRESS, NETWORK };


// Express Setup
const app = express();
const httpServer = createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Initialize marketplace routes and register seeded products with x402 BEFORE middleware
// This ensures all existing products are protected when the middleware is created
initializeRouteConfig(routeConfig, PAYTO_ADDRESS, NETWORK);

// x402 Payment Middleware - must come AFTER route config is fully populated
app.use(paymentMiddleware(routeConfig, x402Server));

// Mount InfoMart Marketplace Routes
app.use('/api/market', marketRoutes);

// SSE Endpoint
app.get('/api/stream', (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string || `session-${Date.now()}`;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  state.sseClients.set(sessionId, res);
  console.log(`SSE client connected: ${sessionId}`);
  res.write(`event: connected\ndata: ${JSON.stringify({ sessionId, timestamp: new Date().toISOString() })}\n\n`);
  req.on('close', () => {
    state.sseClients.delete(sessionId);
    console.log(`SSE client disconnected: ${sessionId}`);
  });
});

function emitToSession(sessionId: string, event: SSEEvent): void {
  const client = state.sseClients.get(sessionId);
  if (client) client.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
}

// Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { query, session_id } = req.body;
  if (!query || typeof query !== 'string') { res.status(400).json({ error: 'Missing or invalid query' }); return; }
  const sessionId = session_id || `session-${Date.now()}`;
  console.log(`\nChat request: "${query.slice(0, 50)}..." [${sessionId}]`);
  res.json({ status: 'processing', sessionId, message: 'Agent is analyzing your query.' });
  
  try {
    const result = await runDueDiligenceAgent(query, sessionId, (event) => {
      emitToSession(sessionId, event);
      if (event.type === 'tx') { state.totalRevenue += event.data.amount; state.totalTransactions++; }
    });
    state.sessions.set(sessionId, result.session);
    emitToSession(sessionId, { type: 'answer', data: { content: result.answer, complete: true } });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Agent error: ${errorMsg}`);
    emitToSession(sessionId, { type: 'error', data: { message: errorMsg, code: 'AGENT_ERROR' } });
  }
});

// Vendor Discovery
app.get('/api/vendors', (_req: Request, res: Response) => {
  res.json({
    market: 'DueDiligence Intelligence Market',
    description: 'Available data vendors for the AI agent',
    budget: `$${AGENT_CONFIG.INITIAL_BUDGET_USD.toFixed(2)}`,
    vendors: getVendorSummary(),
    paymentProtocol: 'x402 v2',
    network: NETWORK,
  });
});

// Vendor Endpoints
for (const vendor of VENDOR_REGISTRY) {
  app.get(`/api/vendor/${vendor.id}`, (req: Request, res: Response) => {
    state.totalRevenue += vendor.cost;
    state.totalTransactions++;
    let txHash = 'unknown';
    let payer = 'unknown';
    const paymentResponse = res.getHeader('PAYMENT-RESPONSE');
    if (paymentResponse) {
      try {
        const decoded = JSON.parse(Buffer.from(paymentResponse as string, 'base64').toString('utf-8'));
        txHash = decoded.transaction || 'unknown';
        payer = decoded.payer || 'unknown';
      } catch { /* ignore */ }
    }
    console.log(`SALE! ${vendor.name} ($${vendor.cost.toFixed(2)}) | TX: ${txHash.slice(0, 16)}...`);
    res.json({ ...vendor.data, timestamp: new Date().toISOString(), meta: { paidBy: payer, txHash, priceUSD: vendor.cost, vendorId: vendor.id } });
  });
}

// Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  res.json({ totalRevenue: state.totalRevenue, totalTransactions: state.totalTransactions, activeSessions: state.sessions.size, connectedClients: state.sseClients.size });
});

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'DueDiligence Intelligence Platform', version: '2.0.0', timestamp: new Date().toISOString() });
});

// API Info
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    service: 'InfoMart - P2P Knowledge Marketplace + DueDiligence Agent',
    status: 'online',
    version: '3.0.0',
    endpoints: {
      // Agent endpoints
      'GET /api/stream': 'SSE endpoint for real-time agent events',
      'POST /api/chat': 'Trigger agent analysis { query, session_id }',
      // Legacy vendor endpoints
      'GET /api/vendors': 'List available data vendors (free)',
      'GET /api/vendor/:id': 'Purchase vendor data (x402 protected)',
      // InfoMart Marketplace endpoints
      'POST /api/market/publish': 'Publish a new product { title, description, price, content, wallet }',
      'GET /api/market/products': 'List all marketplace products (free)',
      'GET /api/market/products/agent': 'Products formatted for agent consumption',
      'GET /api/market/product/:id': 'Get single product details (free)',
      'GET /api/market/product/:id/buy': 'Purchase product content (x402 protected)',
      'GET /api/market/stats': 'Marketplace statistics',
      'GET /api/market/stream': 'SSE endpoint for marketplace events (listings, sales)',
      // Stats
      'GET /api/stats': 'Server statistics',
      'GET /api/health': 'Health check',
    },
    network: NETWORK,
    protocol: 'x402 v2',
    budget: `$${AGENT_CONFIG.INITIAL_BUDGET_USD.toFixed(2)} per session`,
  });
});

// SPA Fallback
app.get('/{*path}', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) { res.status(404).json({ error: 'Not found' }); return; }
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`<!DOCTYPE html><html><head><title>DueDiligence</title><style>body{font-family:system-ui;background:#0a0a0a;color:#fff;padding:2rem}h1{color:#10b981}code{background:#1f2937;padding:0.2rem 0.5rem;border-radius:4px}a{color:#60a5fa}</style></head><body><h1>DueDiligence Platform</h1><p>Backend is running. Start the frontend:</p><pre><code>cd client && npm run dev</code></pre><p>API: <a href="/api">/api</a></p></body></html>`);
    }
  });
});

// Start Server
httpServer.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('INFOMART - P2P KNOWLEDGE MARKETPLACE + DUEDILIGENCE AGENT');
  console.log('='.repeat(70));
  console.log(`Server:     http://localhost:${PORT}`);
  console.log(`API:        http://localhost:${PORT}/api`);
  console.log(`SSE:        http://localhost:${PORT}/api/stream`);
  console.log(`Vendors:    http://localhost:${PORT}/api/vendors`);
  console.log(`Market:     http://localhost:${PORT}/api/market/products`);
  console.log('='.repeat(70));
  console.log('LEGACY VENDOR MARKETPLACE:');
  for (const vendor of VENDOR_REGISTRY) {
    console.log(`   ${vendor.name.padEnd(20)} $${vendor.cost.toFixed(2)} [${vendor.valueRating}]`);
  }
  console.log('='.repeat(70));
  console.log('INFOMART P2P PRODUCTS:');
  const products = getAllProductListings();
  for (const product of products) {
    const typeLabel = product.type === 'human_alpha' ? '🧠 HUMAN' : '🤖 API';
    console.log(`   ${product.title.slice(0, 30).padEnd(32)} $${product.price.toFixed(2)} [${typeLabel}]`);
  }
  console.log('='.repeat(70));
  console.log(`Network:    ${NETWORK} (Base Sepolia Testnet)`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
  console.log(`PayTo:      ${PAYTO_ADDRESS}`);
  console.log('='.repeat(70));
  console.log('\nStart the frontend: cd client && npm run dev\n');
});

export { app, httpServer };
