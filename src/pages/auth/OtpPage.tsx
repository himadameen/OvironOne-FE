import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/AuthShell'
import { DEMO_OTP, useAuthStore } from '@/stores/auth-store'

const LENGTH = 6

export function OtpPage() {
  const navigate = useNavigate()
  const step = useAuthStore((s) => s.step)
  const verifyResetOtp = useAuthStore((s) => s.verifyResetOtp)
  const email = useAuthStore((s) => s.email)
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const [error, setError] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step !== 'reset_otp') {
      navigate('/auth/login', { replace: true })
    }
  }, [step, navigate])

  const update = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = v
    setDigits(next)
    if (v && index < LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const onKey = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (!verifyResetOtp(code)) {
      setError('Invalid code. Check your email and try again.')
      return
    }
    navigate('/auth/reset')
  }

  return (
    <AuthShell
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${email || 'your email'}.`}
    >
      <form onSubmit={submit} className="auth-panel space-y-6">
        <div className="demo-otp-banner" role="status">
          <p className="font-medium text-charcoal">Demo email preview</p>
          <p className="mt-1 text-muted">
            Subject: Your OVIRON ONE reset code
            <br />
            Code: <span className="stat-value font-mono tracking-widest">{DEMO_OTP}</span>
          </p>
        </div>
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              className="h-12 w-11 rounded-btn border border-silver text-center text-lg font-semibold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e.key)}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        {error ? (
          <p className="text-sm text-brand-secondary" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-primary w-full">
          Verify code
        </button>
        <Link to="/auth/login" className="btn-secondary block w-full text-center">
          Cancel
        </Link>
      </form>
    </AuthShell>
  )
}