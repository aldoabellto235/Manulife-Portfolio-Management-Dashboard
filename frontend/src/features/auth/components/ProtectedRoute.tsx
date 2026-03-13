import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // TODO: check admin role from user state
  if (adminOnly) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
