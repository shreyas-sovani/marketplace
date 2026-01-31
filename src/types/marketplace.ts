/**
 * =============================================================================
 * INFOMART - MARKETPLACE TYPE DEFINITIONS
 * =============================================================================
 * Strict TypeScript interfaces for the peer-to-peer knowledge marketplace.
 */

/**
 * Product type classification for the marketplace.
 * - 'human_alpha': Unique human insights, strategies, and insider knowledge
 * - 'api': Automated/programmatic data feeds
 */
export type ProductType = 'human_alpha' | 'api';

/**
 * Core Product interface representing items in the InfoMart marketplace.
 */
export interface Product {
  /** Unique identifier for the product (UUID) */
  id: string;
  
  /** Ethereum wallet address of the seller (receives payment) */
  sellerWallet: string;
  
  /** Display title of the product */
  title: string;
  
  /** Detailed description of what the product contains */
  description: string;
  
  /** Price in USD (USDC). Range: $0.01 - $0.10 */
  price: number;
  
  /** The actual content/data being sold (only revealed after payment) */
  content: string;
  
  /** Classification of the product */
  type: ProductType;
  
  /** ISO timestamp of when the product was published */
  createdAt: string;
  
  /** Optional seller display name */
  sellerName?: string;
  
  /** Number of times this product has been purchased */
  salesCount: number;
}

/**
 * Public-facing product listing (excludes the paid content).
 * Used for browsing the marketplace.
 */
export interface ProductListing {
  id: string;
  sellerWallet: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  createdAt: string;
  sellerName?: string;
  salesCount: number;
}

/**
 * Request payload for publishing a new product.
 */
export interface PublishProductRequest {
  title: string;
  description: string;
  price: number;
  content: string;
  wallet: string;
  type?: ProductType;
  sellerName?: string;
}

/**
 * Response after successfully publishing a product.
 */
export interface PublishProductResponse {
  success: true;
  id: string;
  message: string;
  product: ProductListing;
}

/**
 * Response when purchasing a product (after x402 payment).
 */
export interface PurchaseProductResponse {
  success: true;
  productId: string;
  title: string;
  content: string;
  type: ProductType;
  paidAmount: number;
  sellerWallet: string;
  timestamp: string;
  meta: {
    paidBy: string;
    txHash: string;
    simulation: boolean;
  };
}

/**
 * Marketplace sale event for tracking and SSE streaming.
 */
export interface MarketplaceSaleEvent {
  type: 'sale';
  productId: string;
  productTitle: string;
  sellerWallet: string;
  buyerWallet: string;
  amount: number;
  txHash: string;
  timestamp: string;
}

/**
 * New listing event for SSE streaming.
 */
export interface MarketplaceListingEvent {
  type: 'listing';
  productId: string;
  productTitle: string;
  sellerWallet: string;
  price: number;
  productType: ProductType;
  timestamp: string;
}

/**
 * Union type for all marketplace events.
 */
export type MarketplaceEvent = MarketplaceSaleEvent | MarketplaceListingEvent;

/**
 * Error response structure for API consistency.
 */
export interface MarketplaceErrorResponse {
  success: false;
  error: string;
  code: MarketplaceErrorCode;
  timestamp: string;
}

/**
 * Standardized error codes for the marketplace.
 */
export type MarketplaceErrorCode =
  | 'INVALID_REQUEST'
  | 'PRODUCT_NOT_FOUND'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_FAILED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

/**
 * Marketplace statistics for monitoring.
 */
export interface MarketplaceStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  humanAlphaCount: number;
  apiCount: number;
}
