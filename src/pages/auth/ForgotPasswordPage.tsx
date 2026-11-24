import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/AuthShell'
import { useAuthStore } from '@/stores/auth-store'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const requestReset = useAuthStore((s) => s.requestReset)
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    requestReset(email)
    navigate('/auth/otp')
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email — we send a one-time code (demo shows the code on the next screen)."
    >
      <form onSubmit={submit} className="auth-panel">
        <label className="block space-y-1.5">
          <span className="text-small font-medium text-muted">Work email</span>
          <input
            className="input-field"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary w-full">
          Send verification code
        </button>
        <Link to="/auth/login" className="btn-secondary block w-full text-center">
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}