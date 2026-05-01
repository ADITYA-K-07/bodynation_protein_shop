import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import client, { configureApiClient } from '../api/client';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'bodynation-admin-token';
const AuthContext = createContext<AuthContextValue | null>(null);

function parseTokenExpiry(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function tokenIsFresh(token: string | null) {
  if (!token) {
    return false;
  }

  const expiry = parseTokenExpiry(token);
  return expiry ? expiry > Date.now() : true;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    return tokenIsFresh(storedToken) ? storedToken : null;
  });

  useEffect(() => {
    configureApiClient({
      getToken: () => token,
      onUnauthorized: () => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      },
    });
  }, [token]);

  async function login(email: string, password: string) {
    const response = await client.post<{ token: string }>('/admin/login', { email, password });
    window.localStorage.setItem(TOKEN_KEY, response.data.token);
    setToken(response.data.token);
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: tokenIsFresh(token),
      login,
      logout,
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
