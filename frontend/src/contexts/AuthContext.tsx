"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  syncUser: (user: User) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    console.log("AuthProvider: Fetching current user...");
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    try {
      // validateStatus: chấp nhận 401 như response bình thường, không throw error
      // → tránh Next.js dev overlay hiện lên khi chưa đăng nhập
      const response = await api.get('auth/me', {
        validateStatus: (status) => status < 500,
      });
      if (response.data?.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("AuthProvider: No active session (expected if not logged in)");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('auth/login', { email, password });
      
      if (response.data?.success) {
        // Backend returns token and user, Axios can intercept to handle token if needed
        // but withCredentials should manage cookies. Still we need to set local state.
        const { token, user: loggedInUser } = response.data.data;
        
        // If not using Server Cookies, you might want to store token in localStorage
        localStorage.setItem('token', token);
        // Intercept all future requests to include token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(loggedInUser);
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.post('auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        ...(data.phone && { phone: data.phone }),
      });

      if (response.data?.success) {
        // Optionally, auto-login after register
        await login(data.email, data.password!);
      }
    } catch (error) {
      console.error("Register failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
    router.push("/");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await api.put('users/profile', data);
      if (response.data?.success) {
        setUser((prev) => prev ? { ...prev, ...response.data.data } : null);
      }
    } catch (error) {
      console.error("Update profile failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    setIsLoading(true);
    try {
      await api.put('auth/change-password', {
        currentPassword: oldPass,
        newPassword: newPass,
      });
      console.log("Password changed successfully");
    } catch (error) {
      console.error("Change password failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isAdmin: user?.role === "ADMIN",
        isLoading, 
        login, 
        register, 
        logout, 
        updateProfile, 
        changePassword,
        syncUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
