'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader, ArrowRight } from 'lucide-react';

function LoginPage() {
  const router = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      clearMessages();
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      clearMessages();
      return;
    }

    if (!password) {
      setError('Password is required');
      clearMessages();
      return;
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      clearMessages();
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (email === 'admin@gmail.com' && password === '123') {
      setSuccess('Login successful! Redirecting to dashboard...');
      sessionStorage.setItem("adminEmail", email);
      setTimeout(() => {
        router('/adminDB');
      }, 1500);
    } else {
      setError('Invalid email or password');
      clearMessages();
      setIsLoading(false);
    }
  };

  // Input validation styling
  const getInputBorderColor = (field: 'email' | 'password') => {
    if (!touched[field]) return 'border-blue-200';
    if (field === 'email') {
      return email && isValidEmail(email) ? 'border-green-500' : 'border-red-500';
    }
    if (field === 'password') {
      return password && password.length >= 3 ? 'border-green-500' : 'border-red-500';
    }
    return 'border-blue-200';
  };

  const isFormValid = email && password && isValidEmail(email) && password.length >= 3;

  return (
    <div 
      className="min-h-screen w-full overflow-x-hidden flex items-center justify-center p-4 relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-blue-50/80 to-cyan-50/85"></div>

      {/* Main login card */}
      <div className="w-full max-w-md relative z-10">
        {/* Card with light background */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
          {/* Logo and header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Smart Ambulance Allocation System
            </h1>
            <p className="text-gray-600 text-sm font-medium">Admin Dashboard Access</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl flex items-start gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2.5 text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  onFocus={() => setError('')}
                  placeholder="admin@gmail.com"
                  className={`w-full bg-white/70 border-2 ${getInputBorderColor('email')} rounded-xl pl-12 pr-4 py-3.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:bg-white transition-all duration-300`}
                />
                {touched.email && email && isValidEmail(email) && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {touched.email && email && !isValidEmail(email) && (
                <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Invalid email format
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2.5 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  onFocus={() => setError('')}
                  placeholder="••••••••"
                  className={`w-full bg-white/70 border-2 ${getInputBorderColor('password')} rounded-xl pl-12 pr-12 py-3.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:bg-white transition-all duration-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                {touched.password && password && password.length >= 3 && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {touched.password && password && password.length < 3 && (
                <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Password must be at least 3 characters
                </p>
              )}
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full mt-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-blue-100"></div>

          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm font-medium">
              Emergency Response System
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Secure Admin Portal
            </p>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            © 2024 SmartAmbulance. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Input focus styles */
        input:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

export default LoginPage;