import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, API_BASE_URL } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [licenseClass, setLicenseClassState] = useState(
    () => localStorage.getItem('selectedLicenseClass') || 'Clase B'
  );

  const setLicenseClass = (cls) => {
    localStorage.setItem('selectedLicenseClass', cls);
    setLicenseClassState(cls);
  };

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return null;
    try {
      const userData = await apiFetch('/users/me');
      setUser(userData);
      if (userData.license_class) {
        setLicenseClassState(userData.license_class);
      }
      return userData;
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, [token, refreshUser]);

  const login = async (usernameOrEmail, password) => {
    const formData = new URLSearchParams();
    formData.append('username', usernameOrEmail);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Credenciales incorrectas');
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
  };

  const register = async ({ username, email, password, license_class }) => {
    await apiFetch('/users/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, license_class }),
    });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        licenseClass,
        setLicenseClass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);