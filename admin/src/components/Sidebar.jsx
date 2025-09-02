import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  X,
  ChevronLeft,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
    const { user, logout } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Exams', href: '/exams', icon: BookOpen },
    { name: 'Tests', href: '/tests', icon: FileText },
    { name: 'Statistics', href: '/statistics', icon: TrendingUp },
  ];

  const secondaryNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help & Support', href: '/support', icon: HelpCircle },
  ];

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-teal-700 to-teal-800 transform transition-transform duration-300 ease-in-out
        lg:static lg:inset-0 lg:translate-x-0 lg:shadow-none flex flex-col
        ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-teal-900 border-b border-teal-600">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-md mr-3">
              <TrendingUp className="h-5 w-5 text-teal-700" />
            </div>
            <span className="text-white font-bold text-xl">ExamAdmin</span>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-6 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-teal-900 text-white shadow-lg' 
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Secondary navigation */}
        <div className="px-2 py-4 border-t border-teal-600">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-teal-900 text-white' 
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User area */}
        <div className="flex-shrink-0 flex border-t border-teal-600 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-teal-600">
                <span className="text-sm font-medium text-white">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-teal-200 truncate">{user?.email}</p>
            </div>
            <button className="ml-auto p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-600 focus:outline-none"
            onClick={logout}
            >
              <LogOut className="h-4 w-4"  />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-4 left-4 z-10 lg:hidden p-2 rounded-md bg-teal-700 text-white shadow-lg focus:outline-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default Sidebar;