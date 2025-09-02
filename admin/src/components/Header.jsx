// components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 lg:px-6">
      <div className="flex items-center">
        <button
          className="text-gray-500 hover:text-gray-600 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="hidden lg:ml-4 lg:block">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>
      
      {/* <div className="flex items-center">
        <div className="relative ml-3">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-right">
              <p className="font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500">{user?.email}</p>
            </div>
            <div className="relative">
              <button className="flex text-sm bg-gray-100 rounded-full focus:outline-none">
                <span className="sr-only">Open user menu</span>
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div> */}
    </header>
  );
};

export default Header;