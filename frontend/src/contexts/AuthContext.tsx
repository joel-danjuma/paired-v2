
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { jwtDecode } from "jwt-decode";

type User = {
  id: string;
  email: string;
  user_type: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Computed from first_name + last_name
  profilePic?: string; // profile_image_url from backend
  bio?: string;
  profile_completion_score?: number;
  is_verified_email?: boolean;
  is_verified_phone?: boolean;
  is_verified_identity?: boolean;
  preferences?: any;
  lifestyle_data?: any;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string, fromRegistration?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string, userType: string) => Promise<boolean>;
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

  useEffect(() => {
    const storedToken = localStorage.getItem('pairedToken');
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // Fetch user profile from backend
          fetchUserProfile(storedToken);
        } else {
          localStorage.removeItem('pairedToken');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('pairedToken');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        
        setUser({
          id: userData.id,
          email: userData.email,
          name: fullName || userData.email, // Fallback to email if no name
          user_type: userData.user_type,
          first_name: userData.first_name,
          last_name: userData.last_name,
          profilePic: userData.profile_image_url,
          bio: userData.bio,
          profile_completion_score: userData.profile_completion_score,
          is_verified_email: userData.is_verified_email,
          is_verified_phone: userData.is_verified_phone,
          is_verified_identity: userData.is_verified_identity,
          preferences: userData.preferences,
          lifestyle_data: userData.lifestyle_data
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('pairedToken');
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem('pairedToken');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        // Handle validation errors (422 status)
        if (response.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => 
            `${err.loc ? err.loc.join(' -> ') : ''}: ${err.msg}`
          ).join(', ');
          throw new Error(`Validation error: ${validationErrors}`);
        }
        
        throw new Error(errorData.detail || 'Failed to login');
      }

      const data = await response.json();
      setToken(data.access_token);
      localStorage.setItem('pairedToken', data.access_token);
      
      // Fetch full user profile from backend
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

  const register = async (name: string, email: string, password: string, userType: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: name.split(' ')[0],
          last_name: name.split(' ')[1] || '',
          email,
          password,
          user_type: userType // Use the selected user type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors (422 status)
        if (response.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => 
            `${err.loc ? err.loc.join(' -> ') : ''}: ${err.msg}`
          ).join(', ');
          throw new Error(`Validation error: ${validationErrors}`);
        }
        
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
