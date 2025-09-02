// components/DebugAuth.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
  const { user, loading } = useAuth();
  const [token, setToken] = useState('');
  const [storedUser, setStoredUser] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token') || 'MISSING');
    setStoredUser(localStorage.getItem('user') || 'MISSING');
  }, [user, loading]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-md text-xs z-50 max-w-sm">
      <div className="font-bold mb-2">🔍 AUTH DEBUG</div>
      <div>Loading: {loading ? '✅ Yes' : '❌ No'}</div>
      <div>User: {user ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
      <div>Token: {token ? `✅ ${token.substring(0, 10)}...` : '❌ Missing'}</div>
      <div>Stored User: {storedUser ? '✅ Exists' : '❌ Missing'}</div>
      <div className="mt-2 text-[10px] opacity-70">
        Check browser console for API responses
      </div>
    </div>
  );
};

export default DebugAuth;