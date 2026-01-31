import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Package, Zap, AlertTriangle, Star } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface TickerEvent {
  id: string
  type: 'listing' | 'sale' | 'slash' | 'reward'
  timestamp: string
  data: {
    productTitle?: string
    productId?: string
    price: number
    sellerName?: string
    buyerName?: string
    // Slash/Reward specific
    slashAmount?: number
    rewardAmount?: number
    rating?: number
    reason?: string
  }
}

interface MarketStats {
  totalProducts: number
  totalSales: number
  totalVolume: number
  totalSlashes: number
}

// =============================================================================
// TICKER ITEM COMPONENT
// =============================================================================

function TickerItem({ event }: { event: TickerEvent }) {
  if (event.type === 'listing') {
    return (
      <span className="inline-flex items-center gap-3 px-4 py-1 whitespace-nowrap">
          <span className="flex items-center gap-1">
          <Package className="w-3 h-3 text-accent" />
          <span className="text-accent font-semibold text-xs">[NEW]</span>
        </span>
        <span className="text-text-primary font-inter text-sm">{event.data.productTitle}</span>
        <span className="text-accent text-sm">${event.data.price.toFixed(2)}</span>
        <span className="text-text-secondary text-xs">by {event.data.sellerName || 'Anonymous'}</span>
      </span>
    )
  }

  if (event.type === 'sale') {
    return (
      <span className="inline-flex items-center gap-3 px-4 py-1 whitespace-nowrap">
          <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-accent font-semibold text-xs">[SALE]</span>
        </span>
        <span className="text-text-primary font-inter text-sm">
          {event.data.buyerName || 'Agent'} acquired from {event.data.sellerName || 'Human'}
        </span>
        <span className="text-accent text-sm">${event.data.price.toFixed(2)}</span>
      </span>
    )
  }

  if (event.type === 'slash') {
    return (
      <span className="inline-flex items-center gap-3 px-4 py-1 whitespace-nowrap">
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-red-500 font-share-tech font-semibold text-xs">[SLASH]</span>
        </span>
        <span className="text-text-primary font-inter text-sm">
          Seller {event.data.sellerName || 'Anonymous'} penalized
        </span>
        <span className="text-red-500 font-share-tech font-bold">
          -${event.data.slashAmount?.toFixed(2) || '0.00'}
        </span>
        <span className="text-muted-text text-xs">
          ({event.data.rating}★)
        </span>
      </span>
    )
  }

  if (event.type === 'reward') {
    return (
      <span className="inline-flex items-center gap-3 px-4 py-1 whitespace-nowrap">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-green-500" />
          <span className="text-green-500 font-share-tech font-semibold text-xs">[REWARD]</span>
        </span>
        <span className="text-text-primary font-inter text-sm">
          Seller {event.data.sellerName || 'Anonymous'} rewarded
        </span>
        <span className="text-green-500 font-share-tech font-bold">
          +${event.data.rewardAmount?.toFixed(2) || '0.00'}
        </span>
        <span className="text-muted-text text-xs">
          ({event.data.rating}★)
        </span>
      </span>
    )
  }

  return null
}

// =============================================================================
// MARKET TICKER COMPONENT
// =============================================================================

export default function MarketTicker() {
  const [events, setEvents] = useState<TickerEvent[]>([])
  const [stats, setStats] = useState<MarketStats>({ totalProducts: 0, totalSales: 0, totalVolume: 0, totalSlashes: 0 })
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Connect to market events SSE
  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Connect to the existing /api/market/stream endpoint
      const es = new EventSource('/api/market/stream')
      eventSourceRef.current = es

      es.addEventListener('connected', () => {
        setConnected(true)
        console.log('[MarketTicker] Connected to market events stream')
      })

      // Handle listing events from backend
      es.addEventListener('listing', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
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
          }
          setEvents(prev => [...prev.slice(-19), event]) // Keep last 20 events
          // Update stats
          setStats(prev => ({
            ...prev,
            totalProducts: prev.totalProducts + 1,
          }))
        } catch (err) {
          console.error('[MarketTicker] Failed to parse listing event:', err)
        }
      })

      // Handle sale events from backend
      es.addEventListener('sale', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
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
          }
          setEvents(prev => [...prev.slice(-19), event]) // Keep last 20 events
          // Update stats on sale
          setStats(prev => ({
            ...prev,
            totalSales: prev.totalSales + 1,
            totalVolume: prev.totalVolume + data.amount,
          }))
        } catch (err) {
          console.error('[MarketTicker] Failed to parse sale event:', err)
        }
      })

      // Handle slash events
      es.addEventListener('slash', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          const event: TickerEvent = {
            id: `slash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'slash',
            timestamp: data.timestamp || new Date().toISOString(),
            data: {
              productTitle: data.productTitle,
              productId: data.productId,
              price: data.slashAmount || 0,
              sellerName: data.sellerName || formatWallet(data.sellerWallet),
              slashAmount: data.slashAmount,
              rating: data.rating,
              reason: data.reason,
            },
          }
          setEvents(prev => [...prev.slice(-19), event])
          // Update stats
          setStats(prev => ({
            ...prev,
            totalSlashes: prev.totalSlashes + 1,
          }))
        } catch (err) {
          console.error('[MarketTicker] Failed to parse slash event:', err)
        }
      })

      // Handle reward events
      es.addEventListener('reward', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          const event: TickerEvent = {
            id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'reward',
            timestamp: data.timestamp || new Date().toISOString(),
            data: {
              productTitle: data.productTitle,
              productId: data.productId,
              price: data.rewardAmount || 0,
              sellerName: data.sellerName || formatWallet(data.sellerWallet),
              rewardAmount: data.rewardAmount,
              rating: data.rating,
            },
          }
          setEvents(prev => [...prev.slice(-19), event])
        } catch (err) {
          console.error('[MarketTicker] Failed to parse reward event:', err)
        }
      })

      es.onerror = () => {
        setConnected(false)
        console.log('[MarketTicker] SSE connection lost, reconnecting in 3s...')
        setTimeout(connectSSE, 3000)
      }

      return es
    }

    // Fetch initial stats
    fetch('/api/market/stats')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats({
            totalProducts: data.stats.totalProducts || 0,
            totalSales: data.stats.totalSales || 0,
            totalVolume: parseFloat(data.stats.totalRevenue?.replace('$', '') || '0'),
            totalSlashes: 0,
          })
        }
      })
      .catch(err => console.error('[MarketTicker] Failed to fetch stats:', err))

    // Fetch recent products for initial ticker
    fetch('/api/market/products')
      .then(res => res.json())
      .then(data => {
        const products = data.products || []
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
        }))
        if (initialEvents.length > 0) {
          setEvents(initialEvents)
        }
      })
      .catch(err => console.error('[MarketTicker] Failed to fetch products:', err))

    connectSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // If no events, show placeholder
  if (events.length === 0) {
    return (
      <div className="bg-secondary-bg/90 backdrop-blur border-t border-border/30 py-3 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-text-secondary text-sm font-inter">Waiting for market activity...</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3 text-accent" />
              {stats.totalProducts} products
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent" />
              ${stats.totalVolume.toFixed(2)} volume
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-secondary-bg/90 backdrop-blur border-t border-border/30 overflow-hidden">
      {/* Stats Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/20 text-xs">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-accent font-semibold tracking-wide">INFOMART LIVE</span>
        </div>
        <div className="flex items-center gap-8 text-text-secondary">
          <span className="flex items-center gap-2">
            <Package className="w-3 h-3 text-accent" />
            {stats.totalProducts} Listed
          </span>
          <span className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-accent" />
            {stats.totalSales} Sales
          </span>
          <span className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-accent" />
            ${stats.totalVolume.toFixed(2)} Volume
          </span>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div className="relative overflow-hidden py-2">
        <div className="animate-marquee flex whitespace-nowrap items-center">
          {/* First copy */}
          {events.map((event) => (
            <TickerItem key={event.id} event={event} />
          ))}
          {/* Separator */}
          <span className="inline-flex items-center px-6 text-border/50">•</span>
          {/* Second copy for seamless loop */}
          {events.map((event) => (
            <TickerItem key={`${event.id}-dup`} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format wallet address for display
 */
function formatWallet(wallet: string | undefined): string {
  if (!wallet) return 'Anonymous'
  if (wallet.length <= 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}
