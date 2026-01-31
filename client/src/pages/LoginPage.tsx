import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, User, Wallet, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth, UserRole } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState<UserRole>('buyer')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    walletAddress: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!formData.email || !formData.password || !formData.username || !formData.walletAddress) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Password validation (min 6 chars)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    // Wallet address validation (basic)
    if (formData.walletAddress.trim().length < 5) {
      setError('Please enter a valid wallet address')
      setLoading(false)
      return
    }

    try {
      // Simulate API call - In production, this would call your backend
      // For now, we'll create a mock user
      const newUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        username: formData.username,
        walletAddress: formData.walletAddress,
        role: role,
      }

      // Add a small delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      login(newUser)

      // Navigate to appropriate page based on role
      if (role === 'buyer') {
        navigate('/terminal')
      } else {
        navigate('/sell')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center px-4 py-8">
      {/* Background gradient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl opacity-50" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-bg" />
            </div>
            <h2 className="text-2xl font-space-grotesk font-bold text-accent">InfoMart</h2>
          </div>
          <p className="text-text-secondary mb-8">Knowledge Economy Platform</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => {
              setRole('buyer')
              setError('')
            }}
            className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              role === 'buyer'
                ? 'bg-accent text-primary-bg shadow-lg shadow-accent/30'
                : 'bg-secondary-bg text-secondary-text hover:bg-secondary-bg/80'
            }`}
          >
            Buyer Login
          </button>
          <button
            onClick={() => {
              setRole('seller')
              setError('')
            }}
            className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              role === 'seller'
                ? 'bg-accent text-primary-bg shadow-lg shadow-accent/30'
                : 'bg-secondary-bg text-secondary-text hover:bg-secondary-bg/80'
            }`}
          >
            Seller Login
          </button>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-inter font-semibold text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-primary-bg/60 border border-border/30 rounded-2xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/25 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-inter font-semibold text-text-primary mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="your_username"
                  className="w-full pl-10 pr-4 py-3 bg-primary-bg/60 border border-border/30 rounded-2xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/25 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-inter font-semibold text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-primary-bg/60 border border-border/30 rounded-2xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/25 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Wallet Address Field */}
            <div>
              <label htmlFor="walletAddress" className="block text-sm font-inter font-semibold text-text-primary mb-2">
                Wallet Address
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full pl-10 pr-4 py-3 bg-primary-bg/60 border border-border/30 rounded-2xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/25 transition-all font-mono text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-bg/30 border-t-primary-bg rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="text-center text-xs text-text-secondary pt-2">
              {role === 'buyer'
                ? 'Log in as a buyer to discover and purchase trading insights'
                : 'Log in as a seller to publish and monetize your trading knowledge'}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
