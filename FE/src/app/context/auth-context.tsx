import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import keycloak from '../keycloak';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  register: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const isRun = useRef(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
          pkceMethod: "S256",
        });

        if (authenticated) {
          setToken(keycloak.token || null);
          const profile = await keycloak.loadUserProfile();
          
          // Map Keycloak profile to our User type
          // Note: Keycloak roles can be extracted from token
          const roles = keycloak.tokenParsed?.realm_access?.roles || [];
          const userRole = roles.includes('ADMIN') ? 'ADMIN' : (roles.includes('ORGANIZER') ? 'ORGANIZER' : 'CUSTOMER');

          setUser({
            id: profile.id || "",
            email: profile.email || "",
            full_name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || "User",
            role: userRole,
            status: 'ACTIVE',
            auth_provider: 'LOCAL', // Or maybe 'KEYCLOAK' if we add it to type
            phone_number: '', // Can be mapped if configured in Keycloak
          } as User);
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Keycloak initialization failed:", error);
        // Show an alert to help debug why authentication isn't persisting
        if (error?.error === 'access_denied') {
             console.error('Access denied');
        } else {
             // alert(`Keycloak Error: Cân nhắc mở F12 xem phần Console hoặc tab Network. Lỗi: ${error?.message || error?.error || JSON.stringify(error)}`);
             console.error(error);
        }
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  // Handle token refresh
  useEffect(() => {
    if (keycloak.authenticated) {
      const interval = setInterval(() => {
        keycloak.updateToken(70).then((refreshed) => {
          if (refreshed) {
            setToken(keycloak.token || null);
          }
        }).catch(() => {
          console.error("Failed to refresh token");
          keycloak.logout();
        });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  const login = useCallback(() => {
    keycloak.login({ redirectUri: window.location.origin + "/" });
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin + "/login" });
  }, []);

  const register = useCallback(() => {
    keycloak.register({ redirectUri: window.location.origin + "/" });
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout,
      register,
      isAuthenticated, 
      isAdmin,
      isInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};
