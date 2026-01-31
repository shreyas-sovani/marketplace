import { useState, useEffect, useRef } from 'react';

// Types
interface ProductListing {
  id: string;
  sellerWallet: string;
  sellerName?: string;
  title: string;
  description: string;
  price: number;
  type: 'human_alpha' | 'api';
  createdAt: string;
  salesCount: number;
}

interface MarketplaceEvent {
  type: 'sale' | 'listing';
  productId: string;
  productTitle: string;
  sellerWallet: string;
  amount?: number;
  price?: number;
  buyerWallet?: string;
  txHash?: string;
  timestamp: string;
}

interface PublishForm {
  title: string;
  description: string;
  price: number;
  content: string;
  wallet: string;
  sellerName: string;
  type: 'human_alpha' | 'api';
}

// Price Slider Component
function PriceSlider({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  const percentage = ((value - 0.01) / (0.10 - 0.01)) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-400">Price</label>
        <span className="text-2xl font-bold text-green-400">${value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min="0.01"
        max="0.10"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>$0.01</span>
        <span className="text-gray-400">💡 Higher price = Higher perceived value</span>
        <span>$0.10</span>
      </div>
      {/* Visual indicator */}
      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Live Earnings Card Component
function LiveEarningsCard({ 
  totalEarnings, 
  recentSales 
}: { 
  totalEarnings: number; 
  recentSales: MarketplaceEvent[];
}) {
  const [displayEarnings, setDisplayEarnings] = useState(totalEarnings);
  
  // Animate earnings counter
  useEffect(() => {
    if (totalEarnings > displayEarnings) {
      const diff = totalEarnings - displayEarnings;
      const steps = 20;
      const increment = diff / steps;
      let current = displayEarnings;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= totalEarnings) {
          setDisplayEarnings(totalEarnings);
          clearInterval(interval);
        } else {
          setDisplayEarnings(current);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [totalEarnings, displayEarnings]);

  return (
    <div className="bg-gradient-to-br from-green-900/40 to-gray-800/40 rounded-xl p-6 border border-green-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-400">Live Earnings</h3>
            <p className="text-xs text-gray-500">Real-time USDC balance</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-400">
            ${displayEarnings.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500">USDC on Base Sepolia</div>
        </div>
      </div>
      
      {/* Recent Sales Feed */}
      {recentSales.length > 0 && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-xs text-gray-500 mb-2">Recent Sales</p>
          <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
            {recentSales.slice(0, 5).map((sale, i) => (
              <div 
                key={i}
                className="flex items-center justify-between text-sm animate-slideIn bg-gray-800/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-400">+${sale.amount?.toFixed(2)}</span>
                  <span className="text-gray-400 truncate max-w-[150px]">{sale.productTitle}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(sale.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {recentSales.length === 0 && (
        <div className="border-t border-gray-700 pt-4 mt-4 text-center text-gray-500 text-sm">
          <span className="text-xl">📡</span>
          <p className="mt-1">Waiting for sales...</p>
        </div>
      )}
    </div>
  );
}

// My Products List Component
function MyProductsList({ products, walletFilter }: { products: ProductListing[]; walletFilter: string }) {
  const myProducts = walletFilter 
    ? products.filter(p => p.sellerWallet.toLowerCase() === walletFilter.toLowerCase())
    : [];

  if (!walletFilter) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center text-gray-500">
        <span className="text-3xl">👆</span>
        <p className="mt-2">Enter your wallet address to see your products</p>
      </div>
    );
  }

  if (myProducts.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center text-gray-500">
        <span className="text-3xl">📭</span>
        <p className="mt-2">No products yet. Publish your first knowledge!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
        <span>📦</span> My Products ({myProducts.length})
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {myProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={product.type === 'human_alpha' ? 'text-purple-400' : 'text-blue-400'}>
                    {product.type === 'human_alpha' ? '🧠' : '🤖'}
                  </span>
                  <h4 className="font-semibold text-white">{product.title}</h4>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-green-400 font-bold">${product.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{product.salesCount} sales</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Seller Dashboard Component
export default function SellerDashboard() {
  const [form, setForm] = useState<PublishForm>({
    title: '',
    description: '',
    price: 0.05,
    content: '',
    wallet: '',
    sellerName: '',
    type: 'human_alpha',
  });
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [recentSales, setRecentSales] = useState<MarketplaceEvent[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [connected, setConnected] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load initial products
  useEffect(() => {
    fetch('/api/market/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
        }
      })
      .catch(console.error);
  }, []);

  // Connect to marketplace SSE for real-time updates
  useEffect(() => {
    const es = new EventSource('/api/market/stream');
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      setConnected(true);
    });

    es.addEventListener('listing', (_e: MessageEvent) => {
      // Refresh products list when new listing appears
      fetch('/api/market/products')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setProducts(result.products);
          }
        });
    });

    es.addEventListener('sale', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as MarketplaceEvent;
      setRecentSales(prev => [data, ...prev].slice(0, 10));
      
      // Update earnings if it's for our wallet
      if (form.wallet && data.sellerWallet.toLowerCase() === form.wallet.toLowerCase()) {
        setTotalEarnings(prev => prev + (data.amount || 0));
      }
    });

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
    };
  }, [form.wallet]);

  // Handle form submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishResult(null);

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
      });

      const data = await res.json();

      if (data.success) {
        setPublishResult({ 
          success: true, 
          message: `✅ "${form.title}" published! ID: ${data.id}` 
        });
        // Reset form except wallet
        setForm(prev => ({
          ...prev,
          title: '',
          description: '',
          content: '',
        }));
        // Refresh products
        const productsRes = await fetch('/api/market/products');
        const productsData = await productsRes.json();
        if (productsData.success) {
          setProducts(productsData.products);
        }
      } else {
        setPublishResult({ 
          success: false, 
          message: `❌ ${data.error}` 
        });
      }
    } catch (err) {
      setPublishResult({ 
        success: false, 
        message: `❌ ${err instanceof Error ? err.message : 'Failed to publish'}` 
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Form validation
  const isFormValid = 
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.content.trim().length > 0 &&
    form.wallet.startsWith('0x') &&
    form.wallet.length >= 10;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-400">InfoMart</h1>
              <p className="text-xs text-gray-500">Seller Dashboard • Monetize Your Knowledge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-500">{connected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Publish Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handlePublish} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📝</span> Publish Knowledge
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 'Crypto Tax Loopholes India 2026'"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{form.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what the buyer will learn. Be specific about the value..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{form.description.length}/500 characters</p>
              </div>

              {/* Content (The Paid Data) */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Content (Hidden until purchased) *
                  <span className="text-purple-400 ml-2">🔒</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="This is the valuable content that buyers pay for. Include all your insights, data, strategies..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono text-sm"
                  rows={8}
                />
                <p className="text-xs text-gray-500 mt-1">{form.content.length} characters • Markdown supported</p>
              </div>

              {/* Price Slider */}
              <div className="mb-6 bg-gray-900/50 rounded-lg p-4">
                <PriceSlider 
                  value={form.price} 
                  onChange={(val) => setForm(prev => ({ ...prev, price: val }))}
                />
              </div>

              {/* Type Selection */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Content Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'human_alpha' }))}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      form.type === 'human_alpha'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🧠</div>
                    <div className="font-semibold text-white">Human Alpha</div>
                    <div className="text-xs text-gray-400">Unique insights, strategies</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'api' }))}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      form.type === 'api'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🤖</div>
                    <div className="font-semibold text-white">API / Data</div>
                    <div className="text-xs text-gray-400">Automated data feeds</div>
                  </button>
                </div>
              </div>

              {/* Wallet & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Your Wallet Address *</label>
                  <input
                    type="text"
                    value={form.wallet}
                    onChange={(e) => setForm(prev => ({ ...prev, wallet: e.target.value }))}
                    placeholder="0x..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Receives USDC payments</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Display Name (optional)</label>
                  <input
                    type="text"
                    value={form.sellerName}
                    onChange={(e) => setForm(prev => ({ ...prev, sellerName: e.target.value }))}
                    placeholder="e.g., 'CryptoTaxPro'"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Shown to buyers</p>
                </div>
              </div>

              {/* Publish Result */}
              {publishResult && (
                <div className={`mb-4 p-4 rounded-lg ${
                  publishResult.success 
                    ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                    : 'bg-red-900/30 border border-red-500/50 text-red-400'
                }`}>
                  {publishResult.message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isPublishing}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
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
              recentSales={recentSales.filter(s => 
                !form.wallet || s.sellerWallet.toLowerCase() === form.wallet.toLowerCase()
              )}
            />

            {/* My Products */}
            <MyProductsList products={products} walletFilter={form.wallet} />

            {/* Marketplace Stats */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span>📊</span> Marketplace
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{products.length}</div>
                  <div className="text-xs text-gray-500">Total Products</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {products.filter(p => p.type === 'human_alpha').length}
                  </div>
                  <div className="text-xs text-gray-500">Human Alpha</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-gray-800/20 rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <span>💡</span> Seller Tips
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• <span className="text-yellow-400">Human Alpha</span> sells better than generic data</li>
                <li>• Be specific in your description - agents evaluate ROI</li>
                <li>• Price higher ($0.05+) for unique insights</li>
                <li>• Include actionable takeaways in your content</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
