/**
 * =============================================================================
 * INFOMART - MARKETPLACE SERVICE
 * =============================================================================
 * In-memory product registry for the peer-to-peer knowledge marketplace.
 * Manages product CRUD operations and marketplace state.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Product,
  ProductListing,
  ProductType,
  PublishProductRequest,
  MarketplaceStats,
  MarketplaceEvent,
  MarketplaceSlashEvent,
  MarketplaceRewardEvent,
} from '../types/marketplace.js';

/**
 * The in-memory product database.
 * In production, this would be replaced with a persistent database.
 */
const productRegistry: Map<string, Product> = new Map();

/**
 * Event subscribers for real-time updates (SSE clients).
 */
type EventCallback = (event: MarketplaceEvent) => void;
const eventSubscribers: Set<EventCallback> = new Set();

/**
 * Marketplace statistics tracker.
 */
const stats: MarketplaceStats = {
  totalProducts: 0,
  totalSales: 0,
  totalRevenue: 0,
  humanAlphaCount: 0,
  apiCount: 0,
};

// =============================================================================
// SEED DATA - Initial marketplace products
// =============================================================================

/**
 * HARDCODED SELLER WALLET ADDRESS
 * All marketplace payments go to this address.
 * This is an MVP - in production, each seller would have their own wallet.
 */
export const SELLER_WALLET = '0xB9b4aEcFd092514fDAC6339edba6705287464409';

/**
 * Default stake amount for all new products (Simulated "Platform Credit")
 */
export const DEFAULT_STAKE_AMOUNT = 5.00;

/**
 * Seeds the marketplace with initial products for demo purposes.
 * All payments go to SELLER_WALLET (hardcoded for MVP).
 */
function seedMarketplace(): void {
  
  const seedProducts: Omit<Product, 'id' | 'createdAt' | 'salesCount'>[] = [
    {
      sellerWallet: SELLER_WALLET,  // MVP: all payments go to hardcoded seller wallet
      sellerName: 'Alice (Hackathon Veteran)',
      title: 'AIBhoomi Winning Strategy 2026',
      description: 'Insider tips from a 3x hackathon winner. Learn the exact pitch structure, demo flow, and judge psychology that wins at AIBhoomi. Includes specific talking points for crypto/AI tracks.',
      price: 0.05,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: `
## 🏆 AIBhoomi 2026 Winning Strategy

### The 3-Minute Pitch Formula
1. **Hook (30s)**: Start with a shocking statistic or pain point. "Every day, $2M is lost because AI agents can't pay for data."
2. **Solution (60s)**: One sentence. "We built an AI that argues with itself about money." Demo screenshot here.
3. **Demo (90s)**: Show ONE transaction. Make them see money move. Say "This is real USDC, real blockchain."
4. **Why Us (30s)**: Team credibility + why now (x402 just launched).
5. **Ask (10s)**: "We're raising $500K to scale this to 1000 vendors."

### Judge Psychology
- Judges see 50 pitches. They remember: (1) Demos that worked, (2) Founders who were confident, (3) Ideas they can explain to their spouse.
- DO NOT: Use jargon, show code, or apologize for bugs.
- DO: Make them laugh once. Have a memorable tagline.

### Secret Weapon
The "Transparent Brain" concept is GOLD for hackathons because judges can SEE the AI thinking. This is rare. Emphasize it.

### Track-Specific Tips
- Crypto Track: Mention "real payments, not simulated". Show a block explorer link.
- AI Track: Use "accountable AI" and "audit trail" - regulators love this.

Good luck! 🚀
      `.trim(),
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,  // MVP: all payments go to hardcoded seller wallet
      sellerName: 'Bob (Crypto Tax Expert)',
      title: 'India Crypto Tax Loopholes 2026',
      description: 'Legal tax optimization strategies for Indian crypto traders. Covers NFT gifting, DeFi staking, and the new GIFT city exemptions. NOT financial advice.',
      price: 0.03,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: `
## 💰 India Crypto Tax Optimization (2026 Edition)

### The Basics
- VDA Tax: 30% flat on all gains (no loss offset)
- TDS: 1% on transactions > ₹10,000

### Legal Optimization Strategies

#### 1. GIFT City Exemption
- Registered entities in GIFT IFSC are exempt from TDS
- Route through a GIFT-registered custodian for large transactions
- Cost: ~₹50,000 setup, but saves 1% on every trade

#### 2. NFT Gifting Strategy
- Gifts to relatives are tax-free (spouse, siblings, parents)
- Convert crypto → NFT → Gift → Sell from relative's account
- Caution: Must be genuine gift, not round-tripping

#### 3. DeFi Staking as "Interest"
- Staking rewards may qualify as "income from other sources" (taxed at slab rate, not 30%)
- Document as "interest" not "trading gain"
- Works for: Lido, Rocket Pool, native PoS staking

#### 4. Holding Period Strategy
- No LTCG benefit currently, BUT...
- Proposed amendment in 2026 budget may introduce 12-month LTCG at 20%
- Consider holding until April 2027 if bill passes

### What NOT to Do
- DO NOT use unregistered foreign exchanges (FIU tracking is real now)
- DO NOT attempt to show crypto as "foreign asset" (FEMA violation)

Disclaimer: Consult a CA before acting on this.
      `.trim(),
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,  // MVP: all payments go to hardcoded seller wallet
      sellerName: 'Charlie (Market Analyst)',
      title: 'Bitcoin Sentiment Pulse - Jan 2026',
      description: 'Aggregated sentiment from CT (Crypto Twitter), Reddit, and Discord whales. Includes fear/greed breakdown and whale wallet movements.',
      price: 0.02,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: `
## 📊 Bitcoin Sentiment Pulse - January 31, 2026

### Overall Sentiment: BULLISH (72/100)

### Source Breakdown
| Source | Sentiment | Sample Size | Trend |
|--------|-----------|-------------|-------|
| Crypto Twitter | 78/100 | 125K tweets | ↑ from 65 |
| Reddit r/Bitcoin | 71/100 | 8.2K posts | → stable |
| Discord Whales | 68/100 | 340 members | ↓ from 75 |

### Key Narratives
1. "ETF inflows hitting ATH" - mentioned 12,400 times
2. "Halving supply shock" - mentioned 8,900 times  
3. "Macro liquidity returning" - mentioned 6,200 times
4. "India regulatory clarity" - mentioned 3,100 times (regional spike)

### Whale Wallet Movements (>1000 BTC)
- Net accumulation: +4,200 BTC this week
- Largest single move: 2,100 BTC from Coinbase to unknown wallet (bullish signal)
- Exchange reserves: -1.2% WoW (supply squeeze)

### Contrarian Signals (Caution)
- Funding rates elevated (0.08% - overheated)
- Google Trends "buy bitcoin" at 6-month high (retail FOMO)

### Prediction
70% probability of continuation to $105K before pullback. Set stops below $92K.
      `.trim(),
      type: 'human_alpha',
    },
  ];

  for (const product of seedProducts) {
    const id = uuidv4();
    const fullProduct: Product = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
      salesCount: 0,
    };
    productRegistry.set(id, fullProduct);
    stats.totalProducts++;
    if (product.type === 'human_alpha') {
      stats.humanAlphaCount++;
    } else {
      stats.apiCount++;
    }
  }

  console.log(`[MarketplaceService] Seeded ${seedProducts.length} initial products`);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Publishes a new product to the marketplace.
 * MVP: All payments go to SELLER_WALLET regardless of input wallet.
 */
export function publishProduct(request: PublishProductRequest): Product {
  // Validate required fields
  if (!request.title || request.title.trim().length === 0) {
    throw new Error('Title is required');
  }
  if (!request.description || request.description.trim().length === 0) {
    throw new Error('Description is required');
  }
  if (!request.content || request.content.trim().length === 0) {
    throw new Error('Content is required');
  }
  // Wallet validation is optional for MVP since we use hardcoded SELLER_WALLET
  if (typeof request.price !== 'number' || request.price < 0.01 || request.price > 0.10) {
    throw new Error('Price must be between $0.01 and $0.10');
  }

  const id = uuidv4();
  const product: Product = {
    id,
    // MVP: Always use hardcoded seller wallet for real payments
    sellerWallet: SELLER_WALLET,
    sellerName: request.sellerName,
    title: request.title.trim(),
    description: request.description.trim(),
    price: Math.round(request.price * 100) / 100, // Round to 2 decimal places
    content: request.content.trim(),
    type: request.type || 'human_alpha',
    createdAt: new Date().toISOString(),
    salesCount: 0,
    currentStake: DEFAULT_STAKE_AMOUNT, // Initialize with default stake
  };

  productRegistry.set(id, product);
  stats.totalProducts++;
  if (product.type === 'human_alpha') {
    stats.humanAlphaCount++;
  } else {
    stats.apiCount++;
  }

  // Emit listing event to subscribers
  emitEvent({
    type: 'listing',
    productId: product.id,
    productTitle: product.title,
    sellerWallet: product.sellerWallet,
    sellerName: product.sellerName,
    price: product.price,
    productType: product.type,
    timestamp: product.createdAt,
  });

  console.log(`[MarketplaceService] New product published: "${product.title}" ($${product.price}) by ${product.sellerWallet.slice(0, 10)}...`);

  return product;
}

/**
 * Returns all products as public listings (without content).
 */
export function getAllProductListings(): ProductListing[] {
  const listings: ProductListing[] = [];
  
  for (const product of productRegistry.values()) {
    listings.push({
      id: product.id,
      sellerWallet: product.sellerWallet,
      sellerName: product.sellerName,
      title: product.title,
      description: product.description,
      price: product.price,
      type: product.type,
      createdAt: product.createdAt,
      salesCount: product.salesCount,
      currentStake: product.currentStake,
    });
  }

  // Sort by creation date (newest first)
  return listings.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Returns a single product listing by ID (without content).
 */
export function getProductListing(id: string): ProductListing | undefined {
  const product = productRegistry.get(id);
  if (!product) return undefined;

  return {
    id: product.id,
    sellerWallet: product.sellerWallet,
    sellerName: product.sellerName,
    title: product.title,
    description: product.description,
    price: product.price,
    type: product.type,
    createdAt: product.createdAt,
    salesCount: product.salesCount,
    currentStake: product.currentStake,
  };
}

/**
 * Returns the full product including content (for after payment).
 */
export function getFullProduct(id: string): Product | undefined {
  return productRegistry.get(id);
}

/**
 * Records a sale and returns the full product content.
 * Called after successful x402 payment verification.
 */
export function recordSale(
  productId: string,
  buyerWallet: string,
  txHash: string
): Product | undefined {
  const product = productRegistry.get(productId);
  if (!product) return undefined;

  // Update sales count
  product.salesCount++;
  stats.totalSales++;
  stats.totalRevenue += product.price;

  // Emit sale event to subscribers
  emitEvent({
    type: 'sale',
    productId: product.id,
    productTitle: product.title,
    sellerWallet: product.sellerWallet,
    sellerName: product.sellerName,
    buyerWallet,
    amount: product.price,
    txHash,
    timestamp: new Date().toISOString(),
  });

  // Log with verifiable link if valid txHash
  const isValidTxHash = txHash && txHash.startsWith('0x') && txHash.length === 66;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`💰 SALE RECORDED!`);
  console.log(`   Product: "${product.title}" ($${product.price.toFixed(2)})`);
  console.log(`   Seller: ${product.sellerName} (${product.sellerWallet.slice(0, 10)}...)`);
  console.log(`   Buyer: ${buyerWallet.slice(0, 20)}...`);
  if (isValidTxHash) {
    console.log(`   ✅ TX Hash: ${txHash}`);
    console.log(`   🔗 Verify: https://sepolia.basescan.org/tx/${txHash}`);
  } else {
    console.log(`   ⚠️ TX Hash: ${txHash} (pending verification)`);
  }
  console.log(`${'='.repeat(70)}\n`);

  return product;
}

/**
 * Returns marketplace statistics.
 */
export function getMarketplaceStats(): MarketplaceStats {
  return { ...stats };
}

/**
 * Subscribe to marketplace events (for SSE streaming).
 */
export function subscribeToEvents(callback: EventCallback): () => void {
  eventSubscribers.add(callback);
  return () => eventSubscribers.delete(callback);
}

/**
 * Emit an event to all subscribers.
 */
function emitEvent(event: MarketplaceEvent): void {
  for (const callback of eventSubscribers) {
    try {
      callback(event);
    } catch (error) {
      console.error('[MarketplaceService] Error in event subscriber:', error);
    }
  }
}

/**
 * Returns a summary of products for the agent to browse.
 * Formatted for LLM consumption.
 */
export function getProductSummaryForAgent(): Array<{
  id: string;
  title: string;
  description: string;
  price: string;
  type: ProductType;
  sellerName: string;
}> {
  const listings = getAllProductListings();
  return listings.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: `$${p.price.toFixed(2)}`,
    type: p.type,
    sellerName: p.sellerName || 'Anonymous',
  }));
}

// =============================================================================
// RATING & SLASHING SYSTEM
// =============================================================================

/**
 * Rating/Slashing result interface.
 */
export interface RatingResult {
  success: boolean;
  productId: string;
  rating: number;
  eventType: 'slash' | 'reward';
  stakeChange: number;
  newStake: number;
  reason: string;
}

/**
 * Rate a product and apply slashing logic.
 * 
 * The "Ruthless" Slashing Algorithm (No Rewards - Only Penalties):
 * - Rating 1: SLASH -$3.00 (Completely useless/misleading content)
 * - Rating 2: SLASH -$2.00 (Very poor quality, vague or generic)
 * - Rating 3: SLASH -$1.00 (Below expectations, mediocre)
 * - Rating 4: SLASH -$0.25 (Acceptable but not exceptional)
 * - Rating 5: NO CHANGE $0.00 (Meets expectations - baseline, no reward)
 * 
 * Philosophy: High-quality content is the BASELINE expectation.
 * Sellers don't get rewarded for doing their job - they only get penalized for failing.
 * 
 * @param productId - The product to rate
 * @param rating - Integer 1-5
 * @param reason - Agent's reason for the rating
 */
export function rateProduct(
  productId: string,
  rating: number,
  reason: string
): RatingResult | undefined {
  const product = productRegistry.get(productId);
  if (!product) return undefined;

  // Validate rating
  const normalizedRating = Math.round(Math.max(1, Math.min(5, rating)));
  
  let stakeChange: number;
  let eventType: 'slash' | 'reward';
  
  // The "Ruthless" Slashing Algorithm - NO REWARDS
  switch (normalizedRating) {
    case 1:
      // Catastrophic: Completely useless, misleading, or harmful content
      stakeChange = -3.00;
      eventType = 'slash';
      break;
    case 2:
      // Poor: Very generic, vague, or low-effort content
      stakeChange = -2.00;
      eventType = 'slash';
      break;
    case 3:
      // Below Average: Mediocre, incomplete, or only partially useful
      stakeChange = -1.00;
      eventType = 'slash';
      break;
    case 4:
      // Acceptable: Decent but not exceptional - minor penalty
      stakeChange = -0.25;
      eventType = 'slash';
      break;
    case 5:
      // Excellent: Meets high standards - NO CHANGE (baseline expectation)
      stakeChange = 0.00;
      eventType = 'reward'; // Still emit as reward for UI purposes, but $0
      break;
    default:
      stakeChange = -1.00;
      eventType = 'slash';
  }
  
  // Apply stake change (ensure stake doesn't go below 0)
  const previousStake = product.currentStake;
  const newStake = Math.max(0, product.currentStake + stakeChange);
  product.currentStake = newStake;
  
  // Log the rating event
  console.log(`\n${'='.repeat(70)}`);
  if (stakeChange < 0) {
    console.log(`🔴 STAKE SLASHED!`);
  } else {
    console.log(`⚪ STAKE UNCHANGED (Meets expectations)`);
  }
  console.log(`   Product: "${product.title}"`);
  console.log(`   Seller: ${product.sellerName || 'Anonymous'}`);
  console.log(`   Rating: ${normalizedRating}/5`);
  console.log(`   Previous Stake: $${previousStake.toFixed(2)}`);
  console.log(`   Stake Change: ${stakeChange >= 0 ? '' : ''}$${stakeChange.toFixed(2)}`);
  console.log(`   New Stake: $${newStake.toFixed(2)}`);
  console.log(`   Reason: ${reason}`);
  console.log(`${'='.repeat(70)}\n`);
  
  // Always emit slash event (even for $0 change) so UI can track
  const slashEvent: MarketplaceSlashEvent = {
    type: 'slash',
    productId: product.id,
    productTitle: product.title,
    sellerWallet: product.sellerWallet,
    sellerName: product.sellerName,
    rating: normalizedRating,
    slashAmount: Math.abs(stakeChange),
    newStake,
    reason,
    timestamp: new Date().toISOString(),
  };
  emitEvent(slashEvent);
  
  return {
    success: true,
    productId: product.id,
    rating: normalizedRating,
    eventType,
    stakeChange,
    newStake,
    reason,
  };
}

/**
 * Get the current stake for a product.
 */
export function getProductStake(productId: string): number | undefined {
  const product = productRegistry.get(productId);
  return product?.currentStake;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Seed the marketplace on module load
seedMarketplace();

export {
  productRegistry, // Export for testing purposes
};
