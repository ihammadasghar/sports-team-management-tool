// src/components/AuthGuard.js
import { useEffect } from "react";

const AuthGuard = ({ children, isAuthenticated, navigateTo }) => {
  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("login");
    }
  }, [isAuthenticated, navigateTo]);

  return isAuthenticated ? children : null;
};

export default AuthGuard;
