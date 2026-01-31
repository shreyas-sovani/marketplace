import React, { useState } from 'react'
import { Mail, Lock, User, Wallet, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth, UserRole } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LoginModalProps {
  initialRole?: UserRole
  onClose: () => void
}

export default function LoginModal({ initialRole = 'buyer', onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState<UserRole>(initialRole)
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
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.email || !formData.password || !formData.username || !formData.walletAddress) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const newUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        username: formData.username,
        walletAddress: formData.walletAddress,
        role,
      }

      await new Promise((r) => setTimeout(r, 700))
      login(newUser)
      onClose()
      if (role === 'buyer') navigate('/terminal')
      else navigate('/sell')
    } catch (err) {
      console.error(err)
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md z-10">
        <div className="card p-6 bg-card-bg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sign in</h3>
            <div className="flex gap-2">
              <button onClick={() => setRole('buyer')} className={`py-1 px-3 rounded-xl text-sm ${role === 'buyer' ? 'bg-accent text-primary-bg' : 'bg-secondary-bg text-text-secondary'}`}>
                Buyer
              </button>
              <button onClick={() => setRole('seller')} className={`py-1 px-3 rounded-xl text-sm ${role === 'seller' ? 'bg-accent text-primary-bg' : 'bg-secondary-bg text-text-secondary'}`}>
                Seller
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-2xl bg-primary-bg/60 border border-border/30" />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input name="username" value={formData.username} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-2xl bg-primary-bg/60 border border-border/30" />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-10 p-3 rounded-2xl bg-primary-bg/60 border border-border/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Wallet Address</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input name="walletAddress" value={formData.walletAddress} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-2xl bg-primary-bg/60 border border-border/30 font-mono text-sm" />
              </div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 rounded-2xl">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
