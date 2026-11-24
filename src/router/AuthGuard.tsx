import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

interface AuthGuardProps {
  role?: 'shop_admin' | 'super_admin'
}

export function AuthGuard({ role }: AuthGuardProps) {
  const step = useAuthStore((s) => s.step)
  const userRole = useAuthStore((s) => s.role)

  if (step !== 'authenticated') {
    if (step === 'splash') return <Navigate to="/auth/splash" replace />
    return <Navigate to="/auth/login" replace />
  }

  if (role && userRole !== role) {
    return <Navigate to={userRole === 'super_admin' ? '/super' : '/admin'} replace />
  }

  return <Outlet />
}