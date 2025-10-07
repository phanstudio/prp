// src/services/authService.ts
import axios, { type AxiosInstance, AxiosError } from "axios";

const BACKEND_URL = "https://prp-backend-st1s.onrender.com"; //"http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface TokenPayload {
  sub: string; // email
  exp: number; // expiration timestamp
}

interface RegisterResult {
  user: User;
  autoLoginSuccess: boolean;
}

class AuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BACKEND_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - add token to requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired, logout
          this.logout();

          // Only redirect if not already on login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Get axios instance for use in other services
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Login
  async login(email: string, password: string): Promise<User> {
    try {
      const data = {
        email: email,
        password: password,
      };

      const response = await axios.post<LoginResponse>(
        `${BACKEND_URL}/login`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token } = response.data;
      this.setToken(access_token);

      // Fetch and return user info
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    username?: string
  ): Promise<RegisterResult> {
    let user: User;

    // First try to register
    try {
      const data: any = {
        email: email,
        password: password,
      };

      // Only include username if provided
      if (username && username.trim() !== "") {
        data.username = username;
      }

      const response = await axios.post<User>(`${BACKEND_URL}/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      user = response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }

    // Then try to auto-login
    try {
      const loginData = {
        email: email,
        password: password,
      };

      const response = await axios.post<LoginResponse>(
        `${BACKEND_URL}/login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token } = response.data;
      this.setToken(access_token);

      return {
        user,
        autoLoginSuccess: true,
      };
    } catch (error) {
      console.error("Auto-login after registration failed:", error);
      // Registration succeeded but auto-login failed
      return {
        user,
        autoLoginSuccess: false,
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await this.axiosInstance.get<User>("/auth/me");
    return response.data;
  }

  // Decode JWT token to get payload (client-side only for UI purposes)
  private decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Check if token is expired (client-side check)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;

    // Check if token has expired (exp is in seconds, Date.now() is in ms)
    const now = Date.now() / 1000;
    return payload.exp < now;
  }

  // Check if token is valid
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Client-side expiration check
    return !this.isTokenExpired();
  }

  // Check authentication - verifies with backend
  async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    // Quick client-side check first
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    // Verify with backend that token is still valid
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  // Get token expiration date
  getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return null;

    return new Date(payload.exp * 1000);
  }

  // Get time until expiration in milliseconds
  getTimeUntilExpiration(): number | null {
    const expiration = this.getTokenExpiration();
    if (!expiration) return null;

    return expiration.getTime() - Date.now();
  }

  // Logout
  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  // Token management (using sessionStorage)
  private getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  // Check if user has admin/superuser privileges
  isAdmin(): boolean {
    // This should be checked via user object from getCurrentUser()
    // Can't reliably determine from token alone
    return false;
  }
}

export default new AuthService();
