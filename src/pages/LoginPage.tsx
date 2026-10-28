// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    setIsLoading(true);
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = "Invalid email or password. Please try again.";

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail
            .map((e: any) => e.msg || JSON.stringify(e))
            .join(", ");
        } else if (typeof detail === "object") {
          errorMessage = JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 border border-base-300 card bg-base-100 shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-xs text-base-content/60 mt-1">
            Sign in to access your templates and custom creations
          </p>
        </div>

        {successMessage && (
          <div className="alert alert-success text-xs mb-4 shadow-sm">
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-xs mb-4 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label py-1">
              <span className="label-text text-xs font-semibold">Email Address</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-sm input-bordered w-full pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="label py-1">
              <span className="label-text text-xs font-semibold">Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                minLength={6}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full btn-sm gap-2 mt-2 shadow-sm"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-base-content/70">
          Don't have an account?{" "}
          <Link
            state={{ from: (location.state as any)?.from || "/" }}
            to="/register"
            className="text-primary font-semibold hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
