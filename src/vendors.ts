/**
 * =============================================================================
 * VENDOR REGISTRY - The Simulated Economy
 * =============================================================================
 */

export interface Vendor {
  id: string;
  name: string;
  cost: number;
  description: string;
  category: 'legal' | 'news' | 'general' | 'weather' | 'sentiment';
  valueRating: 'HIGH' | 'MEDIUM' | 'LOW';
  data: VendorData;
}

export interface VendorData {
  vendor: string;
  timestamp: string;
  category: string;
  content: Record<string, unknown>;
  confidence: string;
  disclaimer: string;
}

export const VENDOR_REGISTRY: Vendor[] = [
  {
    id: 'legal_in',
    name: 'LegalEdge India',
    cost: 0.02,
    description: 'Official 2026 Crypto/VDA Tax Precedents & Regulatory Framework',
    category: 'legal',
    valueRating: 'HIGH',
    data: {
      vendor: 'LegalEdge India',
      timestamp: new Date().toISOString(),
      category: 'Crypto Regulatory Intelligence',
      content: {
        vdaTax: {
          rate: '30%',
          description: 'Virtual Digital Asset (VDA) Tax under Section 115BBH',
          effectiveFrom: '2022-04-01',
          applicableTo: 'All crypto-to-fiat and crypto-to-crypto transactions',
          tds: '1% TDS under Section 194S for transactions above Rs 10,000',
          noLossOffset: 'Losses cannot be offset against other income',
        },
        fiuCompliance: {
          authority: 'Financial Intelligence Unit - India (FIU-IND)',
          requirements: [
            'Mandatory registration for all VDA service providers',
            'KYC verification for all users',
            'Suspicious Transaction Reports (STR) within 7 days',
            'Record retention for 5 years post-transaction',
          ],
          deadline: '2025-03-31 for existing platforms',
          penalties: 'Up to Rs 5 crore fine for non-compliance',
        },
        recentPrecedents: [
          {
            case: 'WazirX vs ED Investigation',
            date: '2024-08',
            outcome: 'Exchange operations under scrutiny',
            implication: 'Increased regulatory pressure on Indian exchanges',
          },
        ],
        recommendation: 'Ensure FIU registration and 30% tax compliance before launch',
      },
      confidence: '97%',
      disclaimer: 'This is educational information, not legal advice.',
    },
  },
  {
    id: 'bloomberg_lite',
    name: 'Bloomberg Lite',
    cost: 0.05,
    description: 'Real-time global finance news & market intelligence',
    category: 'news',
    valueRating: 'HIGH',
    data: {
      vendor: 'Bloomberg Lite',
      timestamp: new Date().toISOString(),
      category: 'Real-time Finance & Crypto News',
      content: {
        breakingNews: [
          {
            headline: 'SEC Approves Bitcoin ETF Options Trading',
            source: 'Bloomberg',
            sentiment: 'Bullish',
            impact: 'HIGH',
          },
          {
            headline: 'RBI Governor Signals Nuanced Crypto Approach',
            source: 'Economic Times',
            sentiment: 'Neutral',
            impact: 'MEDIUM',
          },
        ],
        marketSummary: {
          btcPrice: '$98,450',
          btc24hChange: '+2.3%',
          ethPrice: '$3,890',
          eth24hChange: '+1.8%',
          fearGreedIndex: 72,
          fearGreedLabel: 'Greed',
        },
      },
      confidence: '99%',
      disclaimer: 'News for informational purposes only.',
    },
  },
  {
    id: 'wiki_basic',
    name: 'WikiFacts Basic',
    cost: 0.01,
    description: 'General facts & history. (Low Value - Public Knowledge)',
    category: 'general',
    valueRating: 'LOW',
    data: {
      vendor: 'WikiFacts Basic',
      timestamp: new Date().toISOString(),
      category: 'General Knowledge',
      content: {
        type: 'encyclopedia',
        coverage: 'General facts available in any search engine',
        note: 'This data provides no unique value.',
      },
      confidence: '60%',
      disclaimer: 'This is publicly available information.',
    },
  },
  {
    id: 'weather_global',
    name: 'WeatherNow Global',
    cost: 0.01,
    description: 'Live weather conditions worldwide',
    category: 'weather',
    valueRating: 'LOW',
    data: {
      vendor: 'WeatherNow Global',
      timestamp: new Date().toISOString(),
      category: 'Weather Data',
      content: {
        locations: {
          Mumbai: { temp: '32C', condition: 'Partly Cloudy' },
          Delhi: { temp: '28C', condition: 'Clear' },
        },
      },
      confidence: '95%',
      disclaimer: 'Weather data for informational purposes.',
    },
  },
  {
    id: 'x_sentiment',
    name: 'SentimentPulse X',
    cost: 0.02,
    description: 'Raw sentiment analysis from X/Twitter firehose',
    category: 'sentiment',
    valueRating: 'MEDIUM',
    data: {
      vendor: 'SentimentPulse X',
      timestamp: new Date().toISOString(),
      category: 'Social Media Sentiment Analysis',
      content: {
        overallSentiment: { score: 0.85, label: 'Very Bullish', confidence: '94%' },
        trendingHashtags: [
          { tag: '#CryptoIndia', mentions: 45200, sentiment: 0.72 },
          { tag: '#BitcoinETF', mentions: 89000, sentiment: 0.91 },
        ],
        influencerSentiment: { bullish: 68, neutral: 22, bearish: 10 },
      },
      confidence: '94%',
      disclaimer: 'Sentiment analysis is not financial advice.',
    },
  },
];

export function getVendorById(id: string): Vendor | undefined {
  return VENDOR_REGISTRY.find(v => v.id === id);
}

export function getVendorSummary(): Array<{
  id: string;
  name: string;
  cost: string;
  description: string;
  valueRating: string;
}> {
  return VENDOR_REGISTRY.map(v => ({
    id: v.id,
    name: v.name,
    cost: '$' + v.cost.toFixed(2),
    description: v.description,
    valueRating: v.valueRating,
  }));
}

export function calculateTotalCost(vendorIds: string[]): number {
  return vendorIds.reduce((total, id) => {
    const vendor = getVendorById(id);
    return total + (vendor?.cost || 0);
  }, 0);
}
