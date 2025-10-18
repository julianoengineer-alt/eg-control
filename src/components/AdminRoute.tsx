import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.perfil !== 'admin') {
    toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
