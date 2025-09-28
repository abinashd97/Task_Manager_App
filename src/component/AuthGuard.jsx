import React, { useEffect, useState } from "react";
import authService from "../Service/AuthService";

function AuthGuard({ children, onUnauthorized }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      if (user && user.token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (onUnauthorized) {
          onUnauthorized();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [onUnauthorized]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // or redirect to login
  }

  return children;
}

export default AuthGuard;