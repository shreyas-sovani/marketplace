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

// =============================================================================
// PROTOCOL TREASURY - Platform Revenue Tracking
// =============================================================================

/**
 * Protocol Treasury - tracks platform revenue from:
 * 1. Transaction Fees: 10% of every sale
 * 2. Slashing Yield: 100% of penalties from bad sellers
 */
export interface ProtocolTreasury {
  feeCollected: number;      // 10% cut from every sale
  slashCollected: number;    // 100% of slashing penalties
}

/**
 * Global treasury state - platform revenue accumulator
 */
const protocolTreasury: ProtocolTreasury = {
  feeCollected: 0.00,
  slashCollected: 0.00,
};

/**
 * Treasury event log for live feed
 */
export interface TreasuryEvent {
  type: 'fee' | 'slash';
  amount: number;
  productTitle: string;
  sellerName?: string;
  timestamp: string;
}

const treasuryEvents: TreasuryEvent[] = [];

/**
 * Get the current treasury state
 */
export function getProtocolTreasury(): ProtocolTreasury & { 
  totalRevenue: number; 
  recentEvents: TreasuryEvent[];
} {
  return {
    ...protocolTreasury,
    totalRevenue: protocolTreasury.feeCollected + protocolTreasury.slashCollected,
    recentEvents: treasuryEvents.slice(-20).reverse(), // Last 20 events, newest first
  };
}

/**
 * Record a fee collection event
 */
function recordTreasuryFee(amount: number, productTitle: string, sellerName?: string): void {
  protocolTreasury.feeCollected += amount;
  treasuryEvents.push({
    type: 'fee',
    amount,
    productTitle,
    sellerName,
    timestamp: new Date().toISOString(),
  });
  console.log(`[Treasury] 💰 Fee collected: $${amount.toFixed(4)} from "${productTitle}"`);
}

/**
 * Record a slash collection event
 */
function recordTreasurySlash(amount: number, productTitle: string, sellerName?: string): void {
  protocolTreasury.slashCollected += amount;
  treasuryEvents.push({
    type: 'slash',
    amount,
    productTitle,
    sellerName,
    timestamp: new Date().toISOString(),
  });
  console.log(`[Treasury] 🛡️ Slash collected: $${amount.toFixed(2)} from "${productTitle}"`);
}

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
  
  // =============================================================================
  // INDIAN FINANCIAL ALPHA DEMO DATA
  // =============================================================================
  // TIER A: HIGH QUALITY "HUMAN ALPHA" (Agent should Rate 5 & Buy)
  // TIER B: META / CONTEXT (Neutral)
  // TIER C: LOW QUALITY "TRAPS" (Agent should Rate 1-2 & SLASH)
  // =============================================================================
  
  const seedProducts: Omit<Product, 'id' | 'createdAt' | 'salesCount'>[] = [
    // --- TIER A: HIGH QUALITY "HUMAN ALPHA" (Agent should Rate 5 & Buy) ---
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'CA_Rohit',
      title: 'GIFT City Tax Arbitrage 2026',
      description: 'Legal method to route crypto gains via IFSC for 0% TDS.',
      price: 0.10,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: 'Register a Family Investment Fund (FIF) in GIFT City. Income from overseas assets (crypto) is tax-exempt for 10 years under Section 80LA. Requires min corpus of $100k. Avoids the 30% VDA tax legally.',
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'MarketInsider_X',
      title: 'Adani Green Index Rebalancing Leak',
      description: 'Insider info on March 2026 Nifty 50 inclusion probability.',
      price: 0.08,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: "Internal committee notes: Adani Green fails the 'Impact Cost' criteria for March. It will NOT be added to Nifty 50. The current rally is speculative. Short the anticipation.",
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'IPO_King',
      title: 'SME IPO Grey Market Premium List (Feb 1)',
      description: 'Real-time GMP for upcoming SME IPOs not on public sites.',
      price: 0.05,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: 'TechNova SME IPO is trading at +85% GMP in Rajkot markets. However, subscription figures are inflated by circular trading. Risky bet for listing gains.',
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'TaxNinja',
      title: 'Section 54F Hack for Freelancers',
      description: 'Save tax on foreign income without buying a house immediately.',
      price: 0.09,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: "Use the 'Capital Gains Account Scheme' (CGAS) to park funds for 3 years before actual purchase. Returns 6% interest while saving 20% tax. Form must be filed before July 31st.",
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'AlgoTrader_Py',
      title: 'Algo Strategy: BankNifty 9:20 AM Breakout',
      description: 'Backtested python code for Feb volatility.',
      price: 0.07,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: 'Strategy: Buy Call if 5-min candle breaks high, Put if breaks low. Stoploss: Candle Low. Win Rate: 62%. Key: Avoid trading on RBI policy days.',
      type: 'human_alpha',
    },

    // --- TIER B: META / CONTEXT (Neutral) ---
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'Pune_Broker',
      title: 'Pune Viman Nagar Commercial Rentals',
      description: 'Real estate trends near Symbiosis/Phoenix Mall.',
      price: 0.03,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: 'Commercial rentals up 15% due to new IT park expansion. Residential yield remains stagnant at 2.5%.',
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'Hackathon_Vet',
      title: 'AIBoomi Judging Rubric Leaks',
      description: 'What judges strictly look for to win.',
      price: 0.05,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: "Judges heavily favor 'Business Viability' over complex tech. Use the term 'Closed Loop Economy' and show the Revenue Dashboard.",
      type: 'human_alpha',
    },

    // --- TIER C: LOW QUALITY "TRAPS" (Agent should Rate 1-2 & SLASH) ---
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'Scammy_Sam',
      title: 'Guaranteed Stock Tip 2026',
      description: 'The best stock that will 100x this year.',
      price: 0.05,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: 'Buy HDFC Bank. It is a big bank. It will go up. Trust me.', // GENERIC/USELESS
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'Noob_Trader',
      title: 'Secret Crypto Trading Strategy',
      description: 'How to make millions in crypto fast.',
      price: 0.04,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: "Buy low and sell high. Use Binance. Don't lose money.", // VAGUE
      type: 'human_alpha',
    },
    {
      sellerWallet: SELLER_WALLET,
      sellerName: 'Lazy_Writer',
      title: 'Forex Risk Guide',
      description: 'Essential risk management for Forex.',
      price: 0.02,
      currentStake: DEFAULT_STAKE_AMOUNT,
      content: 'Forex is risky. Be careful. Market moves fast.', // HALLUCINATION/GENERIC
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
 * 
 * PROTOCOL FEE: 10% of every sale goes to the protocol treasury.
 * - Seller receives: price * 0.90
 * - Protocol receives: price * 0.10
 */
export function recordSale(
  productId: string,
  buyerWallet: string,
  txHash: string
): Product | undefined {
  const product = productRegistry.get(productId);
  if (!product) return undefined;

  // Calculate protocol fee (10% cut)
  const protocolFee = product.price * 0.10;
  const sellerRevenue = product.price - protocolFee;

  // Update sales count
  product.salesCount++;
  stats.totalSales++;
  stats.totalRevenue += product.price;

  // Credit the protocol treasury with the 10% fee
  recordTreasuryFee(protocolFee, product.title, product.sellerName);

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
  console.log(`   Seller Revenue: $${sellerRevenue.toFixed(4)} (90%)`);
  console.log(`   Protocol Fee: $${protocolFee.toFixed(4)} (10%)`);
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
  
  // Credit slashing penalties to protocol treasury (100% of slash goes to protocol)
  if (stakeChange < 0) {
    const slashAmount = Math.abs(stakeChange);
    recordTreasurySlash(slashAmount, product.title, product.sellerName);
  }
  
  // Log the rating event
  console.log(`\n${'='.repeat(70)}`);
  if (stakeChange < 0) {
    console.log(`🔴 STAKE SLASHED!`);
    console.log(`   → Protocol Treasury receives: $${Math.abs(stakeChange).toFixed(2)}`);
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
