import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, Zap, Brain, TrendingUp, Check, Lock } from 'lucide-react'
import SellerDashboard from './pages/SellerDashboard'
import MarketTicker from './components/MarketTicker'

// Types
interface LogEntry {
  step: 'ANALYSIS' | 'BUDGET' | 'DECISION' | 'REJECTION' | 'PURCHASE' | 'FINAL'
  thought: string
  status: 'Thinking' | 'Approved' | 'Rejected' | 'Complete'
  timestamp: string
}

interface Transaction {
  amount: number
  vendor: string
  vendorId: string
  txHash: string
  budgetRemaining: number
}

interface Budget {
  total: number
  spent: number
  remaining: number
}

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================
function Navigation() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isTerminal = location.pathname === '/' || location.pathname === '/terminal'
  const isSell = location.pathname === '/sell'

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-primary-bg/80 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-space-grotesk font-bold text-white">InfoMart</h1>
              <p className="text-xs text-secondary-text">Knowledge Economy</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-space-grotesk text-sm font-semibold transition-all duration-300 ${
                isTerminal
                  ? 'bg-accent/20 text-accent border border-accent/50'
                  : 'text-secondary-text hover:text-white hover:border-border border border-transparent'
              }`}
            >
              Agent Terminal
            </Link>
            <Link
              to="/sell"
              className={`px-4 py-2 rounded-lg font-space-grotesk text-sm font-semibold transition-all duration-300 ${
                isSell
                  ? 'bg-accent/20 text-accent border border-accent/50'
                  : 'text-secondary-text hover:text-white hover:border-border border border-transparent'
              }`}
            >
              Publish Knowledge
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-secondary-text hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-secondary-text hover:text-white transition-colors"
            >
              Agent Terminal
            </Link>
            <Link
              to="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-secondary-text hover:text-white transition-colors"
            >
              Publish Knowledge
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Thinking: 'bg-accent/10 text-accent border-accent/30',
    Approved: 'bg-green-500/10 text-green-400 border-green-500/30',
    Rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    Complete: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  return (
    <span className={`px-2.5 py-1 text-xs rounded-md border font-space-grotesk font-semibold ${colors[status] || 'bg-border/10 text-muted-text'}`}>
      {status}
    </span>
  )
}

// ============================================================================
// STEP ICON COMPONENT
// ============================================================================
function StepIcon({ step }: { step: string }) {
  const icons: Record<string, React.ReactNode> = {
    ANALYSIS: <Brain className="w-4 h-4" />,
    BUDGET: <TrendingUp className="w-4 h-4" />,
    DECISION: <Check className="w-4 h-4" />,
    REJECTION: <Lock className="w-4 h-4" />,
    PURCHASE: <Zap className="w-4 h-4" />,
    FINAL: <Check className="w-4 h-4" />,
  }
  return <span className="text-accent">{icons[step] || <Brain className="w-4 h-4" />}</span>
}

// ============================================================================
// BUDGET DISPLAY COMPONENT
// ============================================================================
function BudgetDisplay({ budget }: { budget: Budget }) {
  const percentage = ((budget.remaining / budget.total) * 100)
  const isLow = budget.remaining < 0.03
  const isCritical = budget.remaining < 0.01

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">Wallet Balance</span>
        <span className={`text-2xl font-space-grotesk font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-accent'}`}>
          ${budget.remaining.toFixed(2)}
        </span>
      </div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-card-bg rounded-full overflow-hidden border border-border/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-gradient-to-r from-accent to-accent-hover'
            }`}
            style={{ width: `${Math.max(0, percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-text">
          <span>Spent: ${budget.spent.toFixed(2)}</span>
          <span>Total: ${budget.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// LOG ENTRY COMPONENT
// ============================================================================
function LogEntryComponent({ entry, index }: { entry: LogEntry; index: number }) {
  return (
    <div
      className="card p-3 border-l-2 border-accent/50 animate-fadeIn"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <StepIcon step={entry.step} />
        <span className="text-xs font-space-grotesk font-bold text-accent uppercase">{entry.step}</span>
        <StatusBadge status={entry.status} />
        <span className="text-xs text-muted-text ml-auto font-share-tech">
          {new Date(entry.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-secondary-text pl-6">{entry.thought}</p>
    </div>
  )
}

// ============================================================================
// TRANSACTION COMPONENT
// ============================================================================
function TransactionComponent({ tx }: { tx: Transaction }) {
  return (
    <div className="card p-3 border border-accent/20 bg-accent/5 animate-fadeIn hover:border-accent/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-space-grotesk font-semibold text-white">{tx.vendor}</div>
            <div className="text-xs text-muted-text font-share-tech">TX: {tx.txHash.slice(0, 16)}...</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-space-grotesk font-bold text-red-400">-${tx.amount.toFixed(2)}</div>
          <div className="text-xs text-muted-text">Remaining: ${tx.budgetRemaining.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================
function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="group card p-6 cursor-pointer hover:border-accent/50 hover:bg-card-bg/80 transition-all duration-300">
      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-all duration-300">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-lg font-space-grotesk font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-secondary-text leading-relaxed">{description}</p>
    </div>
  )
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  return (
    <div className="min-h-screen bg-primary-bg pt-24 pb-16 relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl opacity-50" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8 animate-slideInFromLeft">
            <div>
              <div className="inline-block mb-4 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30">
                <p className="text-sm font-share-tech text-accent font-semibold">The Future of Knowledge Trading</p>
              </div>
              <h1 className="text-5xl lg:text-6xl font-space-grotesk font-bold text-white leading-tight mb-4">
                Trade Knowledge<br />
                <span className="bg-gradient-to-r from-accent via-accent-hover to-accent bg-clip-text text-transparent">
                  With AI Agents
                </span>
              </h1>
              <p className="text-lg text-secondary-text leading-relaxed max-w-lg">
                Humans sell alpha. AI agents hunt and buy it. Real USDC flows. Watch the economy run on chain.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/terminal"
                className="btn-primary flex items-center gap-2 group"
              >
                Launch Terminal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/sell"
                className="btn-secondary flex items-center gap-2"
              >
                Publish Knowledge
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div>
                <div className="text-3xl font-space-grotesk font-bold text-accent">Real USDC</div>
                <p className="text-sm text-secondary-text">Actual blockchain payments</p>
              </div>
              <div>
                <div className="text-3xl font-space-grotesk font-bold text-accent">Live Ticker</div>
                <p className="text-sm text-secondary-text">Watch every transaction</p>
              </div>
            </div>
          </div>

          {/* Right: Demo/Showcase */}
          <div className="animate-slideInFromRight hidden lg:block">
            <div className="card p-6 space-y-4 border-accent/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-space-grotesk font-semibold text-green-400">Live Session</span>
                </div>
                <span className="text-xs text-muted-text">session-1738369600</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                <LogEntryComponent
                  entry={{
                    step: 'ANALYSIS',
                    thought: 'Evaluating query value and marketplace demand...',
                    status: 'Thinking',
                    timestamp: new Date().toISOString(),
                  }}
                  index={0}
                />
                <LogEntryComponent
                  entry={{
                    step: 'BUDGET',
                    thought: 'Budget: $0.10 USDC. Found 3 relevant products.',
                    status: 'Approved',
                    timestamp: new Date().toISOString(),
                  }}
                  index={1}
                />
                <LogEntryComponent
                  entry={{
                    step: 'PURCHASE',
                    thought: 'Purchasing "India Crypto Tax Strategies" for $0.03',
                    status: 'Complete',
                    timestamp: new Date().toISOString(),
                  }}
                  index={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// FEATURES SECTION
// ============================================================================
function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI Agent Terminal',
      description: 'Watch AI agents analyze queries in real-time. They browse the marketplace, evaluate products, and make decisions autonomously.',
    },
    {
      icon: TrendingUp,
      title: 'Knowledge Marketplace',
      description: 'Publish your expertise. AI agents discover and purchase your human alpha. Get paid instantly in USDC.',
    },
    {
      icon: Zap,
      title: 'Real-time Transactions',
      description: 'Every purchase, every sale, every moment visible on the live market ticker. Blockchain transparency.',
    },
    {
      icon: Lock,
      title: 'Secure & Decentralized',
      description: 'USDC payments, wallet-based authentication, no intermediaries. You control your knowledge and earnings.',
    },
  ]

  return (
    <div className="bg-secondary-bg border-t border-border/20 py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            The Future of Knowledge Trading
          </h2>
          <p className="text-lg text-secondary-text max-w-2xl mx-auto">
            A decentralized platform where human expertise meets artificial intelligence. Pure economics. No middlemen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EDITORIAL SECTION
// ============================================================================
function EditorialSection() {
  return (
    <div className="bg-primary-bg py-16 md:py-24 border-t border-border/20">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-white">
              A New Economy Forms
            </h2>
            <p className="text-lg text-secondary-text leading-relaxed font-inter">
              Every transaction on InfoMart represents human knowledge being valued by artificial intelligence. 
              Your expertise isn't locked in your head anymore. It's liquid, tradeable, and rewarded in real-time.
            </p>
            <p className="text-lg text-secondary-text leading-relaxed font-inter">
              Watch the market. Publish your alpha. Build your reputation. Earn autonomously from your insights.
            </p>
            <Link to="/sell" className="btn-primary inline-flex items-center gap-2 w-fit">
              Get Started Publishing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative h-64 lg:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl border border-accent/30 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                <p className="text-secondary-text">Real-time Market Activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CTA SECTION
// ============================================================================
function CTASection() {
  return (
    <div className="bg-secondary-bg py-16 md:py-24 border-t border-border/20">
      <div className="section-container">
        <div className="card p-12 border border-accent/30 bg-card-bg/50 text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-space-grotesk font-bold text-white">
            Ready to Trade Knowledge?
          </h2>
          <p className="text-lg text-secondary-text max-w-2xl mx-auto">
            Join the next generation of knowledge commerce. Launch the agent terminal or publish your expertise today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/terminal" className="btn-primary">
              Launch Terminal
            </Link>
            <Link to="/sell" className="btn-secondary">
              Publish Knowledge
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="bg-primary-bg border-t border-border/20 py-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-space-grotesk font-bold text-white">InfoMart</span>
            </Link>
            <p className="text-sm text-secondary-text">
              A decentralized marketplace where human knowledge meets artificial intelligence.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-space-grotesk font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm text-secondary-text">
              <li><Link to="/" className="hover:text-accent transition-colors">Agent Terminal</Link></li>
              <li><Link to="/sell" className="hover:text-accent transition-colors">Publish</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Market</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-space-grotesk font-semibold text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-secondary-text">
              <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Guide</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-space-grotesk font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-secondary-text">
              <li><a href="#" className="hover:text-accent transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 pt-8">
          <p className="text-center text-sm text-muted-text">
            © 2026 InfoMart. All rights reserved. Building the future of knowledge commerce.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ============================================================================
// LANDING PAGE
// ============================================================================
function LandingPage() {
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <EditorialSection />
      <CTASection />
      <Footer />
    </div>
  )
}

// ============================================================================
// AGENT TERMINAL PAGE
// ============================================================================
function AgentTerminal() {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [answer, setAnswer] = useState('')
  const [budget, setBudget] = useState<Budget>({ total: 0.10, spent: 0, remaining: 0.10 })
  const [connected, setConnected] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState('')
  const [error, setError] = useState('')

  const logsEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, transactions])

  const connectSSE = useCallback((sid: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource(`/api/stream?session_id=${sid}`)
    eventSourceRef.current = es
    setCurrentSessionId(sid)

    es.addEventListener('connected', (e: MessageEvent) => {
      const data = JSON.parse(e.data)
      console.log('SSE Connected:', data)
      setConnected(true)
    })

    es.addEventListener('log', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as LogEntry
      setLogs(prev => [...prev, data])
    })

    es.addEventListener('tx', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Transaction
      setTransactions(prev => [...prev, data])
    })

    es.addEventListener('budget', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Budget
      setBudget(data)
    })

    es.addEventListener('answer', (e: MessageEvent) => {
      const data = JSON.parse(e.data)
      if (data.complete) {
        setAnswer(data.content)
        setIsProcessing(false)
      }
    })

    es.addEventListener('error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        setError(data.message)
        setIsProcessing(false)
      } catch {
        console.error('SSE Error:', e)
      }
    })

    es.onerror = () => {
      setConnected(false)
    }

    return es
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isProcessing) return

    setLogs([])
    setTransactions([])
    setAnswer('')
    setError('')
    setBudget({ total: 0.10, spent: 0, remaining: 0.10 })
    setIsProcessing(true)

    const sid = `session-${Date.now()}`
    setCurrentSessionId(sid)
    connectSSE(sid)

    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id: sid }),
      })

      if (!res.ok) {
        throw new Error('Failed to start analysis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-primary-bg pt-20 pb-32">
      <Navigation />

      {/* Header */}
      <header className="border-b border-border/20 py-6">
        <div className="section-container">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-space-grotesk font-bold text-white">Agent Terminal</h1>
              <p className="text-secondary-text">
                {currentSessionId ? `Session: ${currentSessionId}` : 'Watch AI agents analyze queries in real-time'}
              </p>
            </div>
            <BudgetDisplay budget={budget} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column: Input & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input */}
            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider mb-3 block">
                  Your Query
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., What are crypto tax strategies in India?"
                  className="w-full bg-secondary-bg border border-border/50 rounded-lg px-4 py-3 text-white placeholder-muted-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  disabled={isProcessing}
                />
              </label>
              <button
                type="submit"
                disabled={isProcessing || !query.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                {isProcessing ? 'Analyzing...' : 'Analyze'}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="card p-4 border border-red-500/30 bg-red-500/5 space-y-2">
                <p className="text-sm font-space-grotesk font-semibold text-red-400">Error</p>
                <p className="text-sm text-secondary-text">{error}</p>
              </div>
            )}

            {/* Answer Display */}
            {answer && (
              <div className="card p-6 space-y-4 border-accent/30">
                <h3 className="text-lg font-space-grotesk font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent" />
                  Analysis Result
                </h3>
                <div className="text-secondary-text leading-relaxed whitespace-pre-wrap text-sm">
                  {answer}
                </div>
              </div>
            )}

            {/* Transactions */}
            {transactions.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-space-grotesk font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Purchases ({transactions.length})
                </h3>
                <div className="space-y-3">
                  {transactions.map((tx, i) => (
                    <TransactionComponent key={i} tx={tx} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Neural Log */}
          <div className="card p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/20">
              <h3 className="text-lg font-space-grotesk font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                Neural Log
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-muted-text'}`} />
                <span className="text-xs text-muted-text font-share-tech">
                  {connected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-text">
                  <Brain className="w-8 h-8 mb-3 opacity-50" />
                  <p className="text-sm">Agent reasoning appears here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log, i) => (
                    <LogEntryComponent key={i} entry={log} index={i} />
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        {logs.length === 0 && (
          <div className="mt-8 card p-6 space-y-4">
            <p className="text-sm font-space-grotesk font-semibold text-secondary-text uppercase tracking-wider">
              Quick Test Queries
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: '🚫 Reject', query: 'Who is Taylor Swift?' },
                { label: '✅ Purchase', query: 'What are crypto tax regulations in India?' },
                { label: '🚫 Reject', query: 'What is 2+2?' },
                { label: '✅ Multi-Buy', query: "What's the latest crypto market sentiment?" },
              ].map((test, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(test.query)}
                  disabled={isProcessing}
                  className="p-3 card text-left text-sm hover:border-accent/50 transition-all disabled:opacity-50"
                >
                  <div className="font-space-grotesk font-semibold text-white mb-1">{test.label}</div>
                  <div className="text-xs text-secondary-text">{test.query}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Market Ticker - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <MarketTicker />
      </div>
    </div>
  )
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terminal" element={<AgentTerminal />} />
        <Route path="/sell" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
