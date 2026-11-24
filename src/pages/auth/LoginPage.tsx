import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/AuthShell'
import { useAuthStore } from '@/stores/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('owner@amburpaint.demo')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    const role = email.includes('super') ? 'super_admin' : 'shop_admin'
    login(email, role)
    navigate('/auth/splash')
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Hardware shop admin — no OTP required for sign in."
    >
      <form onSubmit={submit} className="auth-panel">
        <label className="block space-y-1.5">
          <span className="text-small font-medium text-muted">Email</span>
          <input
            className="input-field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-small font-medium text-muted">Password</span>
          <input
            className="input-field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm text-brand-secondary" role="alert">
            {error}
          </p>
        ) : null}
        <Link to="/auth/forgot" className="text-sm font-medium text-brand-primary hover:underline">
          Forgot password?
        </Link>
        <button type="submit" className="btn-primary w-full">
          Sign in
        </button>
        <div className="space-y-2 border-t border-silver pt-4 text-small text-muted">
          <p>
            <strong className="text-charcoal">Shop admin:</strong> owner@amburpaint.demo
          </p>
          <p>
            <strong className="text-charcoal">Super admin:</strong> super@oviron.demo
          </p>
        </div>
      </form>
    </AuthShell>
  )
}