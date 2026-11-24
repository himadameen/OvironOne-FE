import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/AuthShell'
import { useAuthStore } from '@/stores/auth-store'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const resetToken = useAuthStore((s) => s.resetToken)
  const completeReset = useAuthStore((s) => s.completeReset)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    if (resetToken !== 'verified') {
      navigate('/auth/forgot', { replace: true })
    }
  }, [resetToken, navigate])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8 || password !== confirm) return
    completeReset()
    navigate('/auth/login')
  }

  if (resetToken !== 'verified') {
    return null
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a strong password for your hardware shop account."
    >
      <form onSubmit={submit} className="auth-panel">
        <label className="block space-y-1.5">
          <span className="text-small font-medium text-muted">New password</span>
          <input
            className="input-field"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-small font-medium text-muted">Confirm password</span>
          <input
            className="input-field"
            type="password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary w-full">
          Update password
        </button>
        <Link to="/auth/login" className="btn-secondary block w-full text-center">
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}