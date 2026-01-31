import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import SellerDashboard from './pages/SellerDashboard'

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

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Thinking: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Approved: 'bg-green-500/20 text-green-400 border-green-500/50',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
    Complete: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  )
}

// Step Icon Component
function StepIcon({ step }: { step: string }) {
  const icons: Record<string, string> = {
    ANALYSIS: '��',
    BUDGET: '💰',
    DECISION: '⚖️',
    REJECTION: '🚫',
    PURCHASE: '💳',
    FINAL: '✅',
  }
  return <span className="text-lg">{icons[step] || '📝'}</span>
}

// Budget Display Component
function BudgetDisplay({ budget }: { budget: Budget }) {
  const percentage = ((budget.remaining / budget.total) * 100).toFixed(0)
  const barColor = budget.remaining > 0.05 ? 'bg-green-500' : budget.remaining > 0.02 ? 'bg-yellow-500' : 'bg-red-500'
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm">WALLET BALANCE</span>
        <span className={`text-2xl font-bold ${budget.remaining > 0.05 ? 'text-green-400' : budget.remaining > 0.02 ? 'text-yellow-400' : 'text-red-400'}`}>
          ${budget.remaining.toFixed(2)}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Spent: ${budget.spent.toFixed(2)}</span>
        <span>Budget: ${budget.total.toFixed(2)}</span>
      </div>
    </div>
  )
}

// Neural Log Entry Component
function LogEntryComponent({ entry, index }: { entry: LogEntry; index: number }) {
  return (
    <div 
      className="animate-slideIn bg-gray-800/30 rounded-lg p-3 border-l-2 border-green-500/50 mb-2"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <StepIcon step={entry.step} />
        <span className="text-green-400 font-semibold text-sm">{entry.step}</span>
        <StatusBadge status={entry.status} />
        <span className="text-gray-500 text-xs ml-auto">
          {new Date(entry.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-gray-300 text-sm pl-7">{entry.thought}</p>
    </div>
  )
}

// Transaction Component
function TransactionComponent({ tx }: { tx: Transaction }) {
  return (
    <div className="animate-fadeIn bg-gradient-to-r from-green-900/30 to-transparent rounded-lg p-3 border border-green-500/30 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💸</span>
          <div>
            <div className="text-green-400 font-semibold">{tx.vendor}</div>
            <div className="text-gray-500 text-xs font-mono">TX: {tx.txHash.slice(0, 16)}...</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-red-400 font-bold">-${tx.amount.toFixed(2)}</div>
          <div className="text-gray-500 text-xs">Remaining: ${tx.budgetRemaining.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

// Navigation Component
function Navigation() {
  const location = useLocation()
  const isTerminal = location.pathname === '/' || location.pathname === '/terminal'
  const isSell = location.pathname === '/sell'

  return (
    <nav className="flex items-center gap-1 bg-gray-900/50 rounded-lg p-1">
      <Link
        to="/"
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
          isTerminal
            ? 'bg-green-600 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <span>🤖</span>
        Agent Terminal
      </Link>
      <Link
        to="/sell"
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
          isSell
            ? 'bg-purple-600 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <span>💡</span>
        Sell Knowledge
      </Link>
    </nav>
  )
}

// Agent Terminal (formerly the main app)
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

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, transactions])

  // Connect to SSE
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

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isProcessing) return

    // Reset state
    setLogs([])
    setTransactions([])
    setAnswer('')
    setError('')
    setBudget({ total: 0.10, spent: 0, remaining: 0.10 })
    setIsProcessing(true)

    // Generate session ID
    const sid = `session-${Date.now()}`
    setCurrentSessionId(sid)

    // Connect SSE first
    connectSSE(sid)

    // Small delay to ensure SSE is connected
    await new Promise(resolve => setTimeout(resolve, 100))

    // Send chat request
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-400">InfoMart</h1>
                <p className="text-xs text-gray-500">Agent Terminal</p>
                {currentSessionId && (
                  <p className="text-xs text-gray-600 font-mono">{currentSessionId}</p>
                )}
              </div>
            </div>
            <Navigation />
          </div>
          <BudgetDisplay budget={budget} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Chat Interface */}
          <div className="space-y-4">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <label className="text-sm text-gray-400 mb-2 block">Ask DueDiligence</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., What are the crypto tax regulations in India?"
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !query.trim()}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-400">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            {/* Answer Display */}
            {answer && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📊</span>
                  <h3 className="text-lg font-semibold text-green-400">Analysis Complete</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap">{answer}</div>
                </div>
              </div>
            )}

            {/* Transactions */}
            {transactions.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💳</span>
                  <h3 className="text-lg font-semibold text-green-400">Transactions</h3>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                    {transactions.length} purchase{transactions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {transactions.map((tx, i) => (
                    <TransactionComponent key={i} tx={tx} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Neural Log */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <h3 className="text-lg font-semibold text-green-400">Neural Log</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-4xl mb-4">🧠</span>
                  <p className="text-center">
                    Agent reasoning will appear here<br />
                    <span className="text-sm">Watch DueDiligence think in real-time</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
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
        <div className="mt-6 bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Quick Tests:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuery("What is 2+2?")}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm transition-colors"
              disabled={isProcessing}
            >
              🚫 "What is 2+2?" (Should reject)
            </button>
            <button
              onClick={() => setQuery("What are the crypto tax regulations in India?")}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm transition-colors"
              disabled={isProcessing}
            >
              ✅ "Crypto tax in India?" (Should purchase)
            </button>
            <button
              onClick={() => setQuery("Who is Taylor Swift?")}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm transition-colors"
              disabled={isProcessing}
            >
              🚫 "Who is Taylor Swift?" (Should reject)
            </button>
            <button
              onClick={() => setQuery("What's the latest crypto news and market sentiment?")}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm transition-colors"
              disabled={isProcessing}
            >
              ✅ "Crypto news + sentiment?" (Multi-purchase)
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main App with Router
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AgentTerminal />} />
        <Route path="/terminal" element={<AgentTerminal />} />
        <Route path="/sell" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
