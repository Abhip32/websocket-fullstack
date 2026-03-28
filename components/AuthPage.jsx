'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Store token and call success callback
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4 shadow-lg">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-purple-200 text-sm">
              {isLogin ? 'Sign in to continue chatting' : 'Create your account to start messaging'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-gap-2">
              <AlertCircle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-purple-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300/50 transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-purple-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300/50 transition"
                  required
                />
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-purple-300" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300/50 transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Processing...
                </>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="border-t border-white/20 pt-6">
            <p className="text-center text-purple-200 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-purple-300 hover:text-purple-200 font-semibold underline transition"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300 text-xs mt-6">
          Your conversations are secure and private
        </p>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
