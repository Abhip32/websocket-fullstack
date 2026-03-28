import React, { useState } from 'react';

export const LoginModal = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username.trim());
    } catch (err) {
      setError(err.message || 'Failed to join chat');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chat</h1>
        <p className="text-gray-600 mb-6">Enter a username to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Joining...' : 'Join Chat'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You can chat one-on-one or in groups. Just enter a unique username.
        </p>
      </div>
    </div>
  );
};
