import { useState, useEffect, useRef } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface TickerEvent {
  id: string;
  type: 'listing' | 'sale';
  timestamp: string;
  data: {
    productTitle?: string;
    productId?: string;
    price: number;
    sellerName?: string;
    buyerName?: string;
  };
}

interface MarketStats {
  totalProducts: number;
  totalSales: number;
  totalVolume: number;
}

// =============================================================================
// TICKER ITEM COMPONENT
// =============================================================================

function TickerItem({ event }: { event: TickerEvent }) {
  if (event.type === 'listing') {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1 whitespace-nowrap">
        <span className="text-green-400 font-semibold">[NEW]</span>
        <span className="text-white">'{event.data.productTitle}'</span>
        <span className="text-yellow-400">(${event.data.price.toFixed(2)})</span>
        <span className="text-gray-500">by {event.data.sellerName || 'Anonymous'}</span>
      </span>
    );
  }

  if (event.type === 'sale') {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1 whitespace-nowrap">
        <span className="text-purple-400 font-semibold">[SALE]</span>
        <span className="text-cyan-400">{event.data.buyerName || 'Agent'}</span>
        <span className="text-gray-400">paid</span>
        <span className="text-green-400">{event.data.sellerName || 'Human'}</span>
        <span className="text-yellow-400">(${event.data.price.toFixed(2)})</span>
      </span>
    );
  }

  return null;
}

// =============================================================================
// MARKET TICKER COMPONENT
// =============================================================================

export default function MarketTicker() {
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const [stats, setStats] = useState<MarketStats>({ totalProducts: 0, totalSales: 0, totalVolume: 0 });
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to market events SSE
  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Connect to the existing /api/market/stream endpoint
      const es = new EventSource('/api/market/stream');
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        setConnected(true);
        console.log('[MarketTicker] Connected to market events stream');
      });

      // Handle listing events from backend
      // Backend sends: { type, productId, productTitle, sellerWallet, price, productType, timestamp }
      es.addEventListener('listing', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const event: TickerEvent = {
            id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'listing',
            timestamp: data.timestamp || new Date().toISOString(),
            data: {
              productTitle: data.productTitle,
              productId: data.productId,
              price: data.price,
              sellerName: data.sellerName || formatWallet(data.sellerWallet),
            },
          };
          setEvents(prev => [...prev.slice(-19), event]); // Keep last 20 events
          // Update stats
          setStats(prev => ({
            ...prev,
            totalProducts: prev.totalProducts + 1,
          }));
        } catch (err) {
          console.error('[MarketTicker] Failed to parse listing event:', err);
        }
      });

      // Handle sale events from backend
      // Backend sends: { type, productId, productTitle, sellerWallet, buyerWallet, amount, txHash, timestamp }
      es.addEventListener('sale', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const event: TickerEvent = {
            id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'sale',
            timestamp: data.timestamp || new Date().toISOString(),
            data: {
              productTitle: data.productTitle,
              productId: data.productId,
              price: data.amount,
              sellerName: data.sellerName || formatWallet(data.sellerWallet),
              buyerName: formatWallet(data.buyerWallet),
            },
          };
          setEvents(prev => [...prev.slice(-19), event]); // Keep last 20 events
          // Update stats on sale
          setStats(prev => ({
            ...prev,
            totalSales: prev.totalSales + 1,
            totalVolume: prev.totalVolume + data.amount,
          }));
        } catch (err) {
          console.error('[MarketTicker] Failed to parse sale event:', err);
        }
      });

      es.onerror = () => {
        setConnected(false);
        console.log('[MarketTicker] SSE connection lost, reconnecting in 3s...');
        setTimeout(connectSSE, 3000);
      };

      return es;
    };

    // Fetch initial stats
    fetch('/api/market/stats')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats({
            totalProducts: data.stats.totalProducts || 0,
            totalSales: data.stats.totalSales || 0,
            totalVolume: parseFloat(data.stats.totalRevenue?.replace('$', '') || '0'),
          });
        }
      })
      .catch(err => console.error('[MarketTicker] Failed to fetch stats:', err));

    // Fetch recent products for initial ticker
    fetch('/api/market/products')
      .then(res => res.json())
      .then(data => {
        const products = data.products || [];
        const initialEvents: TickerEvent[] = products.slice(0, 5).map((p: any) => ({
          id: `init-${p.id}`,
          type: 'listing' as const,
          timestamp: p.createdAt || new Date().toISOString(),
          data: {
            productTitle: p.title,
            productId: p.id,
            price: p.price,
            sellerName: p.sellerName || formatWallet(p.sellerWallet),
          },
        }));
        if (initialEvents.length > 0) {
          setEvents(initialEvents);
        }
      })
      .catch(err => console.error('[MarketTicker] Failed to fetch products:', err));

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // If no events, show placeholder
  if (events.length === 0) {
    return (
      <div className="bg-gray-900/80 border-t border-gray-700 py-2 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-gray-500 text-sm">Waiting for market activity...</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>📦 {stats.totalProducts} products</span>
            <span>💰 ${stats.totalVolume.toFixed(2)} volume</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 border-t border-gray-700 overflow-hidden">
      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-green-400 font-semibold">INFOMART LIVE</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <span>📦 {stats.totalProducts} listed</span>
          <span>🛒 {stats.totalSales} sales</span>
          <span>💰 ${stats.totalVolume.toFixed(2)} volume</span>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div className="relative overflow-hidden py-2">
        <div className="animate-marquee flex whitespace-nowrap">
          {/* First copy */}
          {events.map((event) => (
            <TickerItem key={event.id} event={event} />
          ))}
          {/* Separator */}
          <span className="inline-flex items-center px-4 text-gray-600">•••</span>
          {/* Second copy for seamless loop */}
          {events.map((event) => (
            <TickerItem key={`${event.id}-dup`} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format wallet address for display
 */
function formatWallet(wallet: string | undefined): string {
  if (!wallet) return 'Anonymous';
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
