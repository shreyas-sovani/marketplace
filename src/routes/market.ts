/**
 * =============================================================================
 * INFOMART - MARKETPLACE API ROUTES
 * =============================================================================
 * RESTful endpoints for the peer-to-peer knowledge marketplace.
 * Includes x402 paywall integration for product purchases.
 */

import { Router, Request, Response } from 'express';
import {
  publishProduct,
  getAllProductListings,
  getProductListing,
  getFullProduct,
  recordSale,
  getMarketplaceStats,
  subscribeToEvents,
  getProductSummaryForAgent,
} from '../services/marketplaceService.js';
import type {
  PublishProductRequest,
  PublishProductResponse,
  PurchaseProductResponse,
  MarketplaceErrorResponse,
  MarketplaceErrorCode,
  ProductListing,
  MarketplaceEvent,
} from '../types/marketplace.js';

const router = Router();

// =============================================================================
// DYNAMIC x402 ROUTE CONFIG REGISTRATION
// =============================================================================

/**
 * Reference to the global x402 route config.
 * Set by the server during initialization.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalRouteConfig: any = null;
let globalPayToAddress: string = '';
let globalNetwork: string = '';

/**
 * Initialize the route config reference for dynamic product registration.
 * Called by server.ts after x402 middleware is set up.
 * Also registers all existing marketplace products with x402.
 */
export function initializeRouteConfig(
  routeConfig: Record<string, unknown>,
  payToAddress: string,
  network: string
): void {
  globalRouteConfig = routeConfig;
  globalPayToAddress = payToAddress;
  globalNetwork = network;
  console.log('[MarketRoutes] x402 route config initialized for dynamic registration');

  // Register all existing products with x402 (including seeded products)
  registerAllExistingProducts();
}

/**
 * Register all existing marketplace products with x402 paywall.
 * Called during initialization to ensure seeded products are protected.
 * Uses each product's sellerWallet for P2P payments.
 */
function registerAllExistingProducts(): void {
  const products = getAllProductListings();
  for (const product of products) {
    registerProductWithX402(product.id, product.price, product.title, product.sellerWallet);
  }
  console.log(`[MarketRoutes] Registered ${products.length} existing products with x402 paywall`);
}

/**
 * Dynamically register a new product with the x402 paywall.
 * Payment goes to the SELLER's wallet for true P2P commerce.
 */
function registerProductWithX402(productId: string, price: number, title: string, sellerWallet?: string): void {
  if (!globalRouteConfig) {
    console.warn('[MarketRoutes] x402 route config not initialized, skipping registration');
    return;
  }

  // Use seller's wallet for P2P payment, fall back to global address if not provided
  const payTo = sellerWallet || globalPayToAddress;

  const routeKey = `GET /api/market/product/${productId}/buy`;
  globalRouteConfig[routeKey] = {
    accepts: [{
      scheme: 'exact',
      network: globalNetwork,
      price: `$${price.toFixed(2)}`,
      payTo: payTo,
    }],
    description: `Purchase: ${title}`,
  };

  console.log(`[MarketRoutes] Registered x402 paywall for product: ${productId} ($${price.toFixed(2)}) -> ${payTo.slice(0, 10)}...`);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates a standardized error response.
 */
function createErrorResponse(
  error: string,
  code: MarketplaceErrorCode
): MarketplaceErrorResponse {
  return {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logs API requests in a consistent JSON format.
 */
function logRequest(method: string, path: string, data?: Record<string, unknown>): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'InfoMart',
    method,
    path,
    ...data,
  }));
}

/**
 * Logs API errors in a consistent JSON format.
 */
function logError(method: string, path: string, error: unknown): void {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'InfoMart',
    level: 'ERROR',
    method,
    path,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  }));
}

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/market/publish
 * Publish a new product to the marketplace.
 * 
 * Body: { title, description, price, content, wallet, type?, sellerName? }
 * Returns: { success, id, message, product }
 */
router.post('/publish', (req: Request, res: Response): void => {
  const startTime = Date.now();
  
  try {
    logRequest('POST', '/api/market/publish', { title: req.body?.title });

    const body = req.body as PublishProductRequest;

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      res.status(400).json(createErrorResponse('Title is required and must be a string', 'VALIDATION_ERROR'));
      return;
    }
    if (!body.description || typeof body.description !== 'string') {
      res.status(400).json(createErrorResponse('Description is required and must be a string', 'VALIDATION_ERROR'));
      return;
    }
    if (!body.content || typeof body.content !== 'string') {
      res.status(400).json(createErrorResponse('Content is required and must be a string', 'VALIDATION_ERROR'));
      return;
    }
    if (!body.wallet || typeof body.wallet !== 'string' || !body.wallet.startsWith('0x')) {
      res.status(400).json(createErrorResponse('Valid Ethereum wallet address is required', 'VALIDATION_ERROR'));
      return;
    }
    if (typeof body.price !== 'number' || body.price < 0.01 || body.price > 0.10) {
      res.status(400).json(createErrorResponse('Price must be a number between $0.01 and $0.10', 'VALIDATION_ERROR'));
      return;
    }
    if (body.type && !['human_alpha', 'api'].includes(body.type)) {
      res.status(400).json(createErrorResponse('Type must be "human_alpha" or "api"', 'VALIDATION_ERROR'));
      return;
    }

    const product = publishProduct(body);

    // Register the new product with x402 paywall dynamically (payment goes to seller)
    registerProductWithX402(product.id, product.price, product.title, product.sellerWallet);

    const response: PublishProductResponse = {
      success: true,
      id: product.id,
      message: `Product "${product.title}" published successfully`,
      product: {
        id: product.id,
        sellerWallet: product.sellerWallet,
        sellerName: product.sellerName,
        title: product.title,
        description: product.description,
        price: product.price,
        type: product.type,
        createdAt: product.createdAt,
        salesCount: product.salesCount,
      },
    };

    logRequest('POST', '/api/market/publish', { 
      success: true, 
      productId: product.id,
      durationMs: Date.now() - startTime,
    });

    res.status(201).json(response);
  } catch (error) {
    logError('POST', '/api/market/publish', error);
    res.status(500).json(createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      'INTERNAL_ERROR'
    ));
  }
});

/**
 * GET /api/market/products
 * Returns all products (public listings, no content).
 * 
 * Returns: { success, products: ProductListing[], count, stats }
 */
router.get('/products', (_req: Request, res: Response): void => {
  try {
    logRequest('GET', '/api/market/products');

    const products = getAllProductListings();
    const stats = getMarketplaceStats();

    res.json({
      success: true,
      products,
      count: products.length,
      stats: {
        totalProducts: stats.totalProducts,
        totalSales: stats.totalSales,
        totalRevenue: `$${stats.totalRevenue.toFixed(2)}`,
      },
      marketplace: 'InfoMart - P2P Knowledge Marketplace',
      paymentProtocol: 'x402 v2',
    });
  } catch (error) {
    logError('GET', '/api/market/products', error);
    res.status(500).json(createErrorResponse('Failed to fetch products', 'INTERNAL_ERROR'));
  }
});

/**
 * GET /api/market/products/agent
 * Returns products formatted for agent consumption.
 * Optimized for LLM context windows.
 * 
 * Returns: { success, products: [...], instructions }
 */
router.get('/products/agent', (_req: Request, res: Response): void => {
  try {
    logRequest('GET', '/api/market/products/agent');

    const products = getProductSummaryForAgent();

    res.json({
      success: true,
      products,
      count: products.length,
      instructions: 'Use purchase_data tool with the product ID to buy. Prefer "human_alpha" type for unique insights.',
    });
  } catch (error) {
    logError('GET', '/api/market/products/agent', error);
    res.status(500).json(createErrorResponse('Failed to fetch products', 'INTERNAL_ERROR'));
  }
});

/**
 * GET /api/market/product/:id
 * Returns a single product listing (no content).
 * 
 * Returns: { success, product: ProductListing }
 */
router.get('/product/:id', (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    logRequest('GET', `/api/market/product/${id}`);

    const product = getProductListing(id);

    if (!product) {
      res.status(404).json(createErrorResponse(`Product not found: ${id}`, 'PRODUCT_NOT_FOUND'));
      return;
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    logError('GET', `/api/market/product/${req.params.id}`, error);
    res.status(500).json(createErrorResponse('Failed to fetch product', 'INTERNAL_ERROR'));
  }
});

/**
 * GET /api/market/product/:id/buy
 * 🔒 PAYWALL ROUTE - Protected by x402 middleware
 * 
 * Returns the full product content after payment verification.
 * If payment not provided, middleware returns 402 Payment Required.
 * 
 * Returns: PurchaseProductResponse
 */
router.get('/product/:id/buy', (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    logRequest('GET', `/api/market/product/${id}/buy`, { paywall: true });

    const product = getFullProduct(id);

    if (!product) {
      res.status(404).json(createErrorResponse(`Product not found: ${id}`, 'PRODUCT_NOT_FOUND'));
      return;
    }

    // If we reach here, x402 middleware has ALREADY verified the payment.
    // The middleware only calls next() after successful verification.
    // We can trust that payment is valid.
    
    // Try to extract payer info from the payment header for logging
    const paymentHeader = req.headers['payment-signature'] || req.headers['x-payment'];
    let payer = 'verified-by-x402';
    
    if (paymentHeader && typeof paymentHeader === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf-8'));
        payer = decoded.payload?.authorization?.from || decoded.payer || 'verified-by-x402';
      } catch {
        // Ignore decode errors
      }
    }

    console.log(`[x402] ✅ PAYMENT VERIFIED BY MIDDLEWARE`);
    console.log(`[x402] 📦 Product: ${product.title} ($${product.price.toFixed(2)})`);
    console.log(`[x402] 👤 Payer: ${payer}`);
    console.log(`[x402] NOTE: txHash will be in PAYMENT-RESPONSE header after response`);

    // Don't record sale here - the agent will call /record-sale with the real txHash
    // after extracting it from the PAYMENT-RESPONSE header

    const response: PurchaseProductResponse = {
      success: true,
      productId: product.id,
      title: product.title,
      content: product.content,
      type: product.type,
      paidAmount: product.price,
      sellerWallet: product.sellerWallet,
      timestamp: new Date().toISOString(),
      meta: {
        paidBy: payer,
        note: 'Check PAYMENT-RESPONSE header for txHash, then call /record-sale',
        network: 'Base Sepolia (eip155:84532)',
      },
    };

    logRequest('GET', `/api/market/product/${id}/buy`, {
      success: true,
      amount: product.price,
      payer: payer.slice(0, 10),
    });

    res.json(response);
  } catch (error) {
    logError('GET', `/api/market/product/${req.params.id}/buy`, error);
    res.status(500).json(createErrorResponse('Purchase failed', 'INTERNAL_ERROR'));
  }
});

/**
 * GET /api/market/stats
 * Returns marketplace statistics.
 * 
 * Returns: { success, stats: MarketplaceStats }
 */
router.get('/stats', (_req: Request, res: Response): void => {
  try {
    logRequest('GET', '/api/market/stats');

    const stats = getMarketplaceStats();

    res.json({
      success: true,
      stats: {
        totalProducts: stats.totalProducts,
        totalSales: stats.totalSales,
        totalRevenue: `$${stats.totalRevenue.toFixed(2)}`,
        humanAlphaCount: stats.humanAlphaCount,
        apiCount: stats.apiCount,
      },
    });
  } catch (error) {
    logError('GET', '/api/market/stats', error);
    res.status(500).json(createErrorResponse('Failed to fetch stats', 'INTERNAL_ERROR'));
  }
});

/**
 * POST /api/market/product/:id/record-sale
 * Record a sale for simulation mode (when x402 payment is skipped).
 * This allows the marketplace stats and seller revenue to update even in demo mode.
 * 
 * Body: { buyerWallet, txHash }
 * Returns: { success, message, product }
 */
router.post('/product/:id/record-sale', (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const { buyerWallet, txHash } = req.body as { buyerWallet?: string; txHash?: string };
    
    console.log(`\n[record-sale] Received request for product: ${id}`);
    console.log(`[record-sale] buyerWallet: ${buyerWallet}`);
    console.log(`[record-sale] txHash: ${txHash}`);
    
    logRequest('POST', `/api/market/product/${id}/record-sale`, { buyerWallet, txHash });

    const product = getFullProduct(id);

    if (!product) {
      res.status(404).json(createErrorResponse(`Product not found: ${id}`, 'PRODUCT_NOT_FOUND'));
      return;
    }

    // Record the sale
    const buyer = buyerWallet || 'agent-simulation';
    const hash = txHash || 'sim-' + Math.random().toString(36).slice(2, 10);
    
    recordSale(id, buyer, hash);

    res.json({
      success: true,
      message: `Sale recorded for "${product.title}"`,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        content: product.content,
        sellerName: product.sellerName,
        salesCount: product.salesCount + 1, // +1 since recordSale just incremented
      },
      sale: {
        buyerWallet: buyer,
        txHash: hash,
        amount: product.price,
      },
    });
  } catch (error) {
    logError('POST', `/api/market/product/${req.params.id}/record-sale`, error);
    res.status(500).json(createErrorResponse('Failed to record sale', 'INTERNAL_ERROR'));
  }
});

/**
 * GET /api/market/stream
 * SSE endpoint for real-time marketplace events (new listings, sales).
 */
router.get('/stream', (req: Request, res: Response): void => {
  try {
    logRequest('GET', '/api/market/stream');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ 
      timestamp: new Date().toISOString(),
      message: 'Connected to InfoMart event stream',
    })}\n\n`);

    // Subscribe to marketplace events
    const unsubscribe = subscribeToEvents((event: MarketplaceEvent) => {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    });

    // Clean up on disconnect
    req.on('close', () => {
      unsubscribe();
      logRequest('GET', '/api/market/stream', { action: 'disconnect' });
    });
  } catch (error) {
    logError('GET', '/api/market/stream', error);
    res.status(500).json(createErrorResponse('Failed to establish stream', 'INTERNAL_ERROR'));
  }
});

export default router;

/**
 * Helper function to generate x402 route config for all products.
 * Called during server setup to register paywall routes.
 */
export function generateMarketplaceRouteConfig(
  payToAddress: string,
  network: string
): Record<string, unknown> {
  const products = getAllProductListings();
  const routeConfig: Record<string, unknown> = {};

  for (const product of products) {
    routeConfig[`GET /api/market/product/${product.id}/buy`] = {
      accepts: [{
        scheme: 'exact',
        network,
        price: `$${product.price.toFixed(2)}`,
        payTo: payToAddress,
      }],
      description: `Purchase: ${product.title}`,
    };
  }

  return routeConfig;
}

/**
 * Generates route config for a single product (for dynamic registration).
 */
export function generateProductRouteConfig(
  productId: string,
  price: number,
  payToAddress: string,
  network: string
): Record<string, unknown> {
  return {
    [`GET /api/market/product/${productId}/buy`]: {
      accepts: [{
        scheme: 'exact',
        network,
        price: `$${price.toFixed(2)}`,
        payTo: payToAddress,
      }],
      description: `Purchase product ${productId}`,
    },
  };
}
