// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../services/ToastProvider";
import { Lock, Mail, User, Eye, EyeOff, UserPlus } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { addToast } = useToast();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const usernameToPass = username.trim() !== "" ? username.trim() : undefined;
      const result = await register(email, password, usernameToPass);

      if (result.autoLoginFailed) {
        navigate("/login", {
          state: {
            from,
            message: "Registration successful! Please log in with your credentials.",
          },
        });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      let errorMessage = "Registration failed. Please try again.";
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
      addToast(errorMessage, "error", 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 border border-base-300 card bg-base-100 shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-xs text-base-content/60 mt-1">
            Sign up to save templates and generate customized memes
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-xs mb-4 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="username" className="label py-1">
              <span className="label-text text-xs font-semibold">
                Username <span className="text-base-content/50 font-normal">(optional)</span>
              </span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Leave blank to auto-generate"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-sm input-bordered w-full pl-9"
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
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

          <div>
            <label htmlFor="confirmPassword" className="label py-1">
              <span className="label-text text-xs font-semibold">Confirm Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Repeat password"
                minLength={6}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input input-sm input-bordered w-full pl-9 pr-9 ${
                  confirmPassword && password !== confirmPassword ? "input-error" : ""
                }`}
              />
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
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-base-content/70">
          Already have an account?{" "}
          <Link
            state={{ from }}
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
