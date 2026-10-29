// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../services/ToastProvider";
import { Lock, Mail, User, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { safeNavigateBack } from "../utilities/utils";

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
      <div className="max-w-md w-full p-6 sm:p-8 border border-base-300 card bg-base-100 shadow-xl rounded-2xl flex flex-col">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => safeNavigateBack(navigate)}
          className="btn btn-ghost btn-sm gap-1.5 self-start -ml-2 mb-4 text-base-content/70 hover:text-base-content btn-press"
        >
          <ArrowLeft className="w-4 h-4 text-base-content/70" />
          Back
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create Account</h2>
        </div>

        {error && (
          <div className="alert alert-error text-xs mb-4 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <span className="text-sm font-extrabold text-base-content tracking-tight block mb-1.5">
              Username <span className="text-base-content/50 font-normal text-xs">(optional)</span>
            </span>
            <label className="input input-bordered flex items-center gap-2.5 w-full rounded-xl focus-within:border-primary">
              <User className="w-4 h-4 text-base-content/60 shrink-0" />
              <input
                type="text"
                placeholder="Leave blank to auto-generate"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="grow bg-transparent focus:outline-hidden"
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-extrabold text-base-content tracking-tight block mb-1.5">
              Email Address
            </span>
            <label className="input input-bordered flex items-center gap-2.5 w-full rounded-xl focus-within:border-primary">
              <Mail className="w-4 h-4 text-base-content/60 shrink-0" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="grow bg-transparent focus:outline-hidden"
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-extrabold text-base-content tracking-tight block mb-1.5">
              Password
            </span>
            <label className="input input-bordered flex items-center gap-2.5 w-full rounded-xl focus-within:border-primary">
              <Lock className="w-4 h-4 text-base-content/60 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min 6 characters"
                minLength={6}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="grow bg-transparent focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content -mr-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-base-content/70" /> : <Eye className="w-4 h-4 text-base-content/70" />}
              </button>
            </label>
          </div>

          <div>
            <span className="text-sm font-extrabold text-base-content tracking-tight block mb-1.5">
              Confirm Password
            </span>
            <label className="input input-bordered flex items-center gap-2.5 w-full rounded-xl focus-within:border-primary">
              <KeyRound className="w-4 h-4 text-base-content/60 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Repeat password"
                minLength={6}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="grow bg-transparent focus:outline-hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full btn-sm sm:btn-md gap-2 mt-3 shadow-sm rounded-xl text-primary-content font-bold btn-press"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm text-primary-content" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-base-content/70">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
