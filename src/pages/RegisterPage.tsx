// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../services/ToastProvider";
import { Lock, Mail, User } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      // Pass username only if it's not empty
      const usernameToPass = username.trim() !== "" ? username : undefined;
      const result = await register(email, password, usernameToPass);

      if (result.autoLoginFailed) {
        // Registration succeeded but auto-login failed
        // Redirect to login page
        navigate("/login", {
          state: {
            from, // 👈 preserve where they were going
            message: "Registration successful! Please log in with your credentials.",
          },
        });
      } else {
        // Both registration and auto-login succeeded
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      // Format error message properly
      let errorMessage = "Registration failed. Please try again.";

      if (err.response?.data?.detail) {
        // Handle different detail formats
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors format
          errorMessage = detail
            .map((e: any) => e.msg || JSON.stringify(e))
            .join(", ");
        } else if (typeof detail === "object") {
          errorMessage = JSON.stringify(detail);
        }
      }
      addToast(errorMessage, 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border border-base-300 card bg-base-200">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 font-medium">
            Username <span className="text-base-content/50 text-sm">(optional)</span>
          </label>
          <label className="input validator w-full">
            <User className="w-4 h-4"/>
            <input
              type="text" placeholder="killer1234 or Leave blank to auto-generate"
              id="username" value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="email" className="text-md font-meduim">Email</label>
          <label className="input validator w-full">
            <Mail className="w-4 h-4"/>
            <input
              type="email" required placeholder="mail@site.com"
              id="email" value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div className="validator-hint hidden">Enter valid email address</div>
        </div>

        <div>
          <label htmlFor="password" className="text-md font-meduim">Password</label>
          <label className="input validator w-full">
            <Lock className="w-4 h-4"/>
            <input
              type="password" required placeholder="0000000" minLength={6}
              id="password" value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <p className="validator-hint hidden">
						Must be more than 6 characters
            {/* , including */}
						{/* <br/>At least one number
						<br/>At least one lowercase letter
						<br/>At least one uppercase letter */}
					</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-md font-meduim">Confirm Password</label>
          <label className={`input w-full ${error ? "input-error" : ""}`}>
            <Lock className="w-4 h-4"/>
            <input
              id="confirmPassword" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required placeholder="0000000"
            />
          </label>
          {error && (
					<>
					<p className="text-sm text-error">
						Password must match
					</p>
					</>
        )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn
            ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"
            }`}
        >
          {isLoading ? <span className="loading loading-dots loading-md text-primary"/>  : "Register"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-base-content/50">
          Already have an account?{" "}
          <Link 
          state={{ from: (location.state as any)?.from || '/' }} // 👈 carry over destination
          to={"/login"} className="text-accent link link-hover">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
