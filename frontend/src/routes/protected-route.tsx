import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/helpers/auth-provider';
import { useEffect, useState } from 'react';

export function ProtectedRoute() {
  const { isAuthenticated, validateToken } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      await validateToken();
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname, validateToken]);

  if (loading || isAuthenticated === null) {
    // Show a loading state while validating authentication
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
