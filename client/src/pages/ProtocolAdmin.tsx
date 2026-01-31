import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Activity, 
  ArrowLeft,
  RefreshCw,
  Zap,
  AlertTriangle
} from 'lucide-react'

// Types
interface TreasuryEvent {
  type: 'fee' | 'slash'
  amount: number
  productTitle: string
  sellerName?: string
  timestamp: string
}

interface TreasuryData {
  feeCollected: number
  slashCollected: number
  totalRevenue: number
  recentEvents: TreasuryEvent[]
}

// ============================================================================
// METRIC CARD COMPONENT - Big Numbers, Fintech Style
// ============================================================================
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'accent',
  prefix = '$'
}: { 
  title: string
  value: number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'accent' | 'green' | 'yellow' | 'red'
  prefix?: string
}) {
  const colorClasses = {
    accent: 'text-accent border-accent/30 bg-accent/5',
    green: 'text-green-400 border-green-500/30 bg-green-500/5',
    yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
  }

  const iconBgClasses = {
    accent: 'bg-accent/20',
    green: 'bg-green-500/20',
    yellow: 'bg-yellow-500/20',
    red: 'bg-red-500/20',
  }

  return (
    <div className={`card p-6 border ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBgClasses[color]} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        <span className="text-xs font-space-grotesk uppercase tracking-wider text-text-secondary">
          {title}
        </span>
      </div>
      <div className={`text-4xl md:text-5xl font-space-grotesk font-bold ${colorClasses[color].split(' ')[0]} mb-2`}>
        {prefix}{value.toFixed(4)}
      </div>
      <p className="text-sm text-text-secondary">{subtitle}</p>
    </div>
  )
}

// ============================================================================
// LIVE FEED ITEM COMPONENT
// ============================================================================
function LiveFeedItem({ event }: { event: TreasuryEvent }) {
  const isFee = event.type === 'fee'
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${
      isFee 
        ? 'border-green-500/20 bg-green-500/5' 
        : 'border-yellow-500/20 bg-yellow-500/5'
    } animate-fadeIn`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        isFee ? 'bg-green-500/20' : 'bg-yellow-500/20'
      }`}>
        {isFee ? (
          <DollarSign className="w-5 h-5 text-green-400" />
        ) : (
          <Shield className="w-5 h-5 text-yellow-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-space-grotesk font-bold ${
            isFee ? 'text-green-400' : 'text-yellow-400'
          }`}>
            +${event.amount.toFixed(4)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-bg text-text-secondary">
            {isFee ? 'Fee' : 'Penalty'}
          </span>
        </div>
        <p className="text-sm text-text-secondary truncate">
          {event.productTitle}
          {event.sellerName && ` • ${event.sellerName}`}
        </p>
      </div>
      
      <div className="text-xs text-text-secondary whitespace-nowrap">
        {new Date(event.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

// ============================================================================
// PROTOCOL ADMIN DASHBOARD
// ============================================================================
export default function ProtocolAdmin() {
  const [treasury, setTreasury] = useState<TreasuryData>({
    feeCollected: 0,
    slashCollected: 0,
    totalRevenue: 0,
    recentEvents: [],
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch treasury data
  const fetchTreasury = async () => {
    try {
      const response = await fetch('/api/market/treasury')
      const data = await response.json()
      if (data.success) {
        setTreasury(data.treasury)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch treasury:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch + polling every 1 second for live updates
  useEffect(() => {
    fetchTreasury()
    const interval = setInterval(fetchTreasury, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Header */}
      <header className="bg-primary-bg/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="p-2 rounded-xl hover:bg-secondary-bg transition-colors text-text-secondary hover:text-accent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-space-grotesk font-bold text-text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Protocol Treasury
                </h1>
                <p className="text-sm text-text-secondary">Platform Revenue Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live</span>
              </div>
              <button 
                onClick={fetchTreasury}
                className="p-2 rounded-xl hover:bg-secondary-bg transition-colors text-text-secondary hover:text-accent"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Treasury */}
          <MetricCard
            title="Total Treasury"
            value={treasury.totalRevenue}
            subtitle="Combined platform revenue"
            icon={TrendingUp}
            color="green"
          />
          
          {/* Platform Fees */}
          <MetricCard
            title="Platform Fees"
            value={treasury.feeCollected}
            subtitle="10% cut from every sale"
            icon={DollarSign}
            color="accent"
          />
          
          {/* Risk Yield */}
          <MetricCard
            title="Risk Yield"
            value={treasury.slashCollected}
            subtitle="100% of slashing penalties"
            icon={Shield}
            color="yellow"
          />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Split Visualization */}
          <div className="card p-6">
            <h2 className="text-lg font-space-grotesk font-bold text-text-primary mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Revenue Split
            </h2>
            
            <div className="space-y-6">
              {/* Fee Revenue Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-space-grotesk font-semibold text-text-secondary">
                    Transaction Fees (10%)
                  </span>
                  <span className="text-sm font-space-grotesk font-bold text-accent">
                    ${treasury.feeCollected.toFixed(4)}
                  </span>
                </div>
                <div className="h-4 bg-secondary-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500"
                    style={{ 
                      width: treasury.totalRevenue > 0 
                        ? `${(treasury.feeCollected / treasury.totalRevenue) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>

              {/* Slash Revenue Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-space-grotesk font-semibold text-text-secondary">
                    Slashing Penalties (100%)
                  </span>
                  <span className="text-sm font-space-grotesk font-bold text-yellow-400">
                    ${treasury.slashCollected.toFixed(4)}
                  </span>
                </div>
                <div className="h-4 bg-secondary-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ 
                      width: treasury.totalRevenue > 0 
                        ? `${(treasury.slashCollected / treasury.totalRevenue) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Revenue Model Info */}
            <div className="mt-8 p-4 rounded-xl bg-secondary-bg border border-border/20">
              <h3 className="text-sm font-space-grotesk font-bold text-text-primary mb-3">
                Revenue Model
              </h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span><strong className="text-accent">10% Fee</strong> on every sale → Sustainable income</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span><strong className="text-yellow-400">100% Slash</strong> on penalties → Quality enforcement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="card p-6">
            <h2 className="text-lg font-space-grotesk font-bold text-text-primary mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Live Revenue Feed
            </h2>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
              {treasury.recentEvents.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                  <p className="text-text-secondary">No revenue events yet</p>
                  <p className="text-xs text-text-secondary mt-1">Events will appear as sales and slashes occur</p>
                </div>
              ) : (
                treasury.recentEvents.map((event, index) => (
                  <LiveFeedItem key={`${event.timestamp}-${index}`} event={event} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="card p-4 border border-border/20">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-text-secondary">Fee Events: {treasury.recentEvents.filter(e => e.type === 'fee').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-text-secondary">Slash Events: {treasury.recentEvents.filter(e => e.type === 'slash').length}</span>
              </div>
            </div>
            <div className="text-text-secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
