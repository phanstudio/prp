// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
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
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border border-base-300 card">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      
      {successMessage && (
        <div className="mb-4 text-green-700 bg-green-100 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {error && (
          <div className="text-red-700 bg-red-100 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn
            ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"
            }`}
        >
          {isLoading ? <span className="loading loading-dots loading-md text-primary"/> : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-base-content/50">
          Don't have an account?{' '}
          <Link to={"/register"} className="text-accent link link-hover">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
