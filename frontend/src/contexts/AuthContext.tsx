
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { jwtDecode } from "jwt-decode";

type User = {
  id: string;
  email: string;
  user_type: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Added for new login logic
  profilePic?: string; // Added for new login logic
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string, fromRegistration?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from API
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          email: userData.email,
          user_type: userData.user_type,
          first_name: userData.first_name,
          last_name: userData.last_name,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
          profilePic: userData.profile_image_url
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('pairedToken');
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // Fetch user profile based on token
          fetchUserProfile(storedToken);
        } else {
          localStorage.removeItem('pairedToken');
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('pairedToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, fromRegistration = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to login');
      }

      const data = await response.json();
      setToken(data.access_token);
      localStorage.setItem('pairedToken', data.access_token);
      
      // Fetch full user profile
      await fetchUserProfile(data.access_token);
      
      if (!fromRegistration) {
        toast.success("Successfully logged in!");
      }
      return true; // Indicate success

    } catch (error) {
      toast.error("Login failed: " + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: name.split(' ')[0],
          last_name: name.split(' ')[1] || '',
          email,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register');
      }

      // After successful registration, log the user in
      const loginSuccess = await login(email, password, true);
      if (loginSuccess) {
        toast.success("Account created successfully! Let's get you set up.");
        return true; // Indicate success to navigate
      } else {
        throw new Error("Failed to log in after registration.");
      }
    } catch (error) {
      toast.error("Registration failed: " + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pairedToken');
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
