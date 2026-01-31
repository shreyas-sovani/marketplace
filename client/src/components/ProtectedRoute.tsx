import { Navigate } from 'react-router-dom'
import { useAuth, UserRole } from '../context/AuthContext'

interface ProtectedRouteProps {
  element: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ element, requiredRole }: ProtectedRouteProps) {
  const { isLoggedIn, user } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return element
}
