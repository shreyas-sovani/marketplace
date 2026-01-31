import { useState, useEffect, useRef } from 'react'
import { Zap, Package, TrendingUp, Lock, AlertCircle, ExternalLink, Brain } from 'lucide-react'

// Types
interface ProductListing {
  id: string
  sellerWallet: string
  sellerName?: string
  title: string
  description: string
  price: number
  type: 'human_alpha' | 'api'
  createdAt: string
  salesCount: number
}

interface MarketplaceEvent {
  type: 'sale' | 'listing'
  productId: string
  productTitle: string
  sellerWallet: string
  amount?: number
  price?: number
  buyerWallet?: string
  txHash?: string
  timestamp: string
}

interface PublishForm {
  title: string
  description: string
  price: number
  content: string
  wallet: string
  sellerName: string
  type: 'human_alpha' | 'api'
}

// ============================================================================
// PRICE SLIDER COMPONENT
// ============================================================================
function PriceSlider({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  const percentage = ((value - 0.01) / (0.10 - 0.01)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
          Price
        </label>
        <span className="text-3xl font-space-grotesk font-bold bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">
          ${value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min="0.01"
        max="0.10"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-secondary-bg rounded-full appearance-none cursor-pointer accent-accent"
      />
      <div className="flex items-center justify-between text-xs">
        <span className="text-secondary-text">$0.01 min</span>
        <span className="text-secondary-text font-share-tech">Higher price = Higher perceived value</span>
        <span className="text-secondary-text">$0.10 max</span>
      </div>
      <div className="h-1 bg-secondary-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// LIVE EARNINGS CARD COMPONENT
// ============================================================================
function LiveEarningsCard({
  totalEarnings,
  recentSales,
}: {
  totalEarnings: number
  recentSales: MarketplaceEvent[]
}) {
  const [displayEarnings, setDisplayEarnings] = useState(totalEarnings)

  useEffect(() => {
    if (totalEarnings > displayEarnings) {
      const diff = totalEarnings - displayEarnings
      const steps = 20
      const increment = diff / steps
      let current = displayEarnings

      const interval = setInterval(() => {
        current += increment
        if (current >= totalEarnings) {
          setDisplayEarnings(totalEarnings)
          clearInterval(interval)
        } else {
          setDisplayEarnings(current)
        }
      }, 50)

      return () => clearInterval(interval)
    }
  }, [totalEarnings, displayEarnings])

  return (
    <div className="card p-6 border-accent/30 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
          <Zap className="w-6 h-6 text-accent" />
        </div>
        <div>
          <p className="text-xs font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
            Live Earnings
          </p>
          <p className="text-xs text-secondary-text">Real-time USDC balance</p>
        </div>
      </div>

      <div className="space-y-1 bg-card-bg rounded-lg p-4 text-secondary-text">
        <div className="text-4xl font-space-grotesk font-bold text-accent">
          ${displayEarnings.toFixed(4)}
        </div>
        <p className="text-xs text-secondary-text font-share-tech">USDC on Base Sepolia</p>
      </div>

      {/* Recent Sales Feed */}
      {recentSales.length > 0 && (
        <div className="border-t border-secondary-bg pt-4 space-y-2">
          <p className="text-xs font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
            Recent Sales
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
            {recentSales.slice(0, 5).map((sale, i) => {
              const isValidTxHash = sale.txHash && sale.txHash.startsWith('0x') && sale.txHash.length === 66
              return (
                <div
                  key={i}
                  className="flex flex-col gap-1 text-sm bg-card-bg/50 rounded-lg px-3 py-2 border border-border/20 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Zap className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="text-accent font-space-grotesk font-semibold">
                        +${sale.amount?.toFixed(2)}
                      </span>
                      <span className="text-secondary-text truncate text-xs">{sale.productTitle}</span>
                    </div>
                    <span className="text-xs text-muted-text font-share-tech flex-shrink-0">
                      {new Date(sale.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {isValidTxHash && sale.txHash ? (
                    <a 
                      href={`https://sepolia.basescan.org/tx/${sale.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent/80 hover:text-accent transition-colors font-share-tech group ml-5"
                    >
                      <span>Verify: {sale.txHash.slice(0, 10)}...{sale.txHash.slice(-6)}</span>
                      <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-text font-share-tech ml-5">Payment verified ✓</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {recentSales.length === 0 && (
        <div className="border-t border-secondary-bg pt-4 text-center text-secondary-text text-sm">
          <Package className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p>Waiting for sales...</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MY PRODUCTS LIST COMPONENT
// ============================================================================
function MyProductsList({ products, walletFilter }: { products: ProductListing[]; walletFilter: string }) {
  const myProducts = walletFilter
    ? products.filter((p) => p.sellerWallet.toLowerCase() === walletFilter.toLowerCase())
    : []

  if (!walletFilter) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-secondary-text mb-3 opacity-50" />
        <p className="text-secondary-text text-sm">Enter your wallet address to see your products</p>
      </div>
    )
  }

  if (myProducts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Package className="w-8 h-8 mx-auto text-secondary-text mb-3 opacity-50" />
        <p className="text-secondary-text text-sm">No products yet. Publish your first knowledge!</p>
      </div>
    )
  }

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-space-grotesk font-bold text-accent flex items-center gap-2">
        <Package className="w-5 h-5 text-accent" />
        My Products ({myProducts.length})
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {myProducts.map((product) => (
          <div
            key={product.id}
            className="card-hover p-4 space-y-2 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      {product.type === 'human_alpha' ? <Brain className="w-4 h-4 text-accent" /> : <Package className="w-4 h-4 text-accent" />}
                    </div>
                  <h4 className="font-space-grotesk font-semibold text-accent truncate">{product.title}</h4>
                </div>
                <p className="text-xs text-secondary-text line-clamp-2">{product.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-accent font-space-grotesk font-bold text-sm">${product.price.toFixed(2)}</div>
                <div className="text-xs text-secondary-text font-share-tech">{product.salesCount} sales</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN SELLER DASHBOARD COMPONENT
// ============================================================================
export default function SellerDashboard() {
  const [form, setForm] = useState<PublishForm>({
    title: '',
    description: '',
    price: 0.05,
    content: '',
    wallet: '',
    sellerName: '',
    type: 'human_alpha',
  })

  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null)
  const [products, setProducts] = useState<ProductListing[]>([])
  const [recentSales, setRecentSales] = useState<MarketplaceEvent[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [connected, setConnected] = useState(false)

  const eventSourceRef = useRef<EventSource | null>(null)

  // Load initial products
  useEffect(() => {
    fetch('/api/market/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products)
        }
      })
      .catch(console.error)
  }, [])

  // Connect to marketplace SSE for real-time updates
  useEffect(() => {
    const es = new EventSource('/api/market/stream')
    eventSourceRef.current = es

    es.addEventListener('connected', () => {
      setConnected(true)
    })

    es.addEventListener('listing', (_e: MessageEvent) => {
      // Refresh products list when new listing appears
      fetch('/api/market/products')
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setProducts(result.products)
          }
        })
    })

    es.addEventListener('sale', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as MarketplaceEvent
      setRecentSales((prev) => [data, ...prev].slice(0, 10))

      // Update earnings if it's for our wallet
      if (form.wallet && data.sellerWallet.toLowerCase() === form.wallet.toLowerCase()) {
        setTotalEarnings((prev) => prev + (data.amount || 0))
      }
    })

    es.onerror = () => {
      setConnected(false)
    }

    return () => {
      es.close()
    }
  }, [form.wallet])

  // Handle form submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPublishing(true)
    setPublishResult(null)

    try {
      const res = await fetch('/api/market/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: form.price,
          content: form.content,
          wallet: form.wallet,
          sellerName: form.sellerName || undefined,
          type: form.type,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setPublishResult({
          success: true,
          message: `✅ "${form.title}" published! ID: ${data.id}`,
        })
        // Reset form except wallet
        setForm((prev) => ({
          ...prev,
          title: '',
          description: '',
          content: '',
        }))
        // Refresh products
        const productsRes = await fetch('/api/market/products')
        const productsData = await productsRes.json()
        if (productsData.success) {
          setProducts(productsData.products)
        }
      } else {
        setPublishResult({
          success: false,
          message: `❌ ${data.error}`,
        })
      }
    } catch (err) {
      setPublishResult({
        success: false,
        message: `❌ ${err instanceof Error ? err.message : 'Failed to publish'}`,
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Form validation
  const isFormValid =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.content.trim().length > 0 &&
    form.wallet.startsWith('0x') &&
    form.wallet.length >= 10

  return (
    <div className="min-h-screen bg-primary-bg pt-20 pb-8">
      {/* Navigation Bar - Reuse from App */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-primary-bg/80 backdrop-blur-xl border-b border-secondary-bg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300">
                <Zap className="w-5 h-5 text-primary-bg" />
              </div>
              <div>
                <h1 className="text-lg font-space-grotesk font-bold text-accent">InfoMart</h1>
                <p className="text-xs text-secondary-text">Seller Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-secondary-text'}`} />
              <span className="text-xs text-secondary-text font-share-tech">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left: Publish Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handlePublish} className="card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-space-grotesk font-bold text-accent flex items-center gap-3">
                  <Package className="w-6 h-6 text-accent" />
                  Publish Knowledge
                </h2>
                <p className="text-sm text-secondary-text mt-1">Share your expertise with AI agents</p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Crypto Tax Loopholes India 2026"
                  className="w-full bg-secondary-bg border border-border/50 rounded-lg px-4 py-3 text-secondary-text placeholder-muted-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  maxLength={100}
                />
                <p className="text-xs text-muted-text">{form.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what the buyer will learn. Be specific about the value you provide..."
                  className="w-full bg-secondary-bg border border-border/50 rounded-lg px-4 py-3 text-secondary-text placeholder-muted-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-text">{form.description.length}/500 characters</p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent" />
                  Content (Hidden until purchased) *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="This is the valuable content that buyers pay for. Include all your insights, data, strategies, and actionable takeaways..."
                  className="w-full bg-secondary-bg border border-border/50 rounded-lg px-4 py-3 text-secondary-text placeholder-muted-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none font-share-tech text-sm"
                  rows={10}
                />
                <p className="text-xs text-muted-text">{form.content.length} characters • Markdown supported</p>
              </div>

              {/* Price Slider */}
              <div className="bg-card-bg/50 rounded-lg p-4 text-secondary-text">
                <PriceSlider
                  value={form.price}
                  onChange={(val) => setForm((prev) => ({ ...prev, price: val }))}
                />
              </div>

              {/* Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      key: 'human_alpha' as const,
                      icon: <Brain className="w-6 h-6 text-accent" />,
                      title: 'Human Alpha',
                      subtitle: 'Unique insights, strategies',
                    },
                    {
                      key: 'api' as const,
                      icon: <Package className="w-6 h-6 text-accent" />,
                      title: 'API / Data',
                      subtitle: 'Automated data feeds',
                    },
                  ].map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: type.key }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        form.type === type.key
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-border/70'
                      }`}
                    >
                      <div className="mb-2">{type.icon}</div>
                      <div className="font-space-grotesk font-bold text-text-primary text-sm">{type.title}</div>
                      <div className="text-xs text-secondary-text">{type.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
                    Your Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={form.wallet}
                    onChange={(e) => setForm((prev) => ({ ...prev, wallet: e.target.value }))}
                    placeholder="0x..."
                    className="w-full bg-secondary-bg border border-border/50 rounded-lg px-4 py-3 text-secondary-text placeholder-muted-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-share-tech text-sm"
                  />
                  <p className="text-xs text-muted-text">Receives USDC payments</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
                    Display Name (optional)
                  </label>
                  <input
                    type="text"
                    value={form.sellerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, sellerName: e.target.value }))}
                    placeholder="e.g., CryptoTaxPro"
                    className="w-full bg-secondary-bg border border-border/50 rounded-lg px-4 py-3 text-secondary-text placeholder-muted-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                  <p className="text-xs text-muted-text">Visible to buyers</p>
                </div>
              </div>

              {/* Publish Result */}
              {publishResult && (
                <div
                  className={`p-4 rounded-lg border ${
                    publishResult.success
                      ? 'bg-green-500/5 border-green-500/30 text-green-400'
                      : 'bg-red-500/5 border-red-500/30 text-red-400'
                  }`}
                >
                  <p className="text-sm font-space-grotesk font-semibold">{publishResult.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isPublishing}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isPublishing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Publish for ${form.price.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Stats & Products */}
          <div className="space-y-6">
            {/* Live Earnings */}
            <LiveEarningsCard
              totalEarnings={totalEarnings}
              recentSales={recentSales.filter(
                (s) => !form.wallet || s.sellerWallet.toLowerCase() === form.wallet.toLowerCase()
              )}
            />

            {/* My Products */}
            <MyProductsList products={products} walletFilter={form.wallet} />

            {/* Marketplace Stats */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-space-grotesk font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Marketplace
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card-bg rounded-lg p-4 text-center text-secondary-text">
                  <div className="text-2xl font-space-grotesk font-bold text-accent">{products.length}</div>
                  <div className="text-xs text-muted-text mt-1">Total Products</div>
                </div>
                <div className="bg-secondary-bg rounded-lg p-4 text-center border border-border/20">
                  <div className="text-2xl font-space-grotesk font-bold text-accent">
                    {products.filter((p) => p.type === 'human_alpha').length}
                  </div>
                  <div className="text-xs text-muted-text mt-1">Human Alpha</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6 border-accent/20 bg-accent/5 space-y-3">
              <h3 className="text-lg font-space-grotesk font-bold text-accent flex items-center gap-2">
                💡 Seller Tips
              </h3>
              <ul className="text-sm text-secondary-text space-y-2">
                <li className="flex gap-2">
                  <span className="text-accent flex-shrink-0">•</span>
                  <span>
                    <span className="text-accent font-semibold">Human Alpha</span> sells better than generic data
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent flex-shrink-0">•</span>
                  <span>Be specific in descriptions — agents evaluate ROI</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent flex-shrink-0">•</span>
                  <span>Price higher ($0.05+) for unique insights</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent flex-shrink-0">•</span>
                  <span>Include actionable takeaways in your content</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
