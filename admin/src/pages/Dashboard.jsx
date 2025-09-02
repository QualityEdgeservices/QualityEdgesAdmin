import React from 'react';
import useSWR from 'swr';
import api from '../utils/api';
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  UserPlus,
  AlertCircle
} from 'lucide-react';

// SWR fetcher function
const fetcher = (url) => api.get(url).then(res => res.data);

const Dashboard = () => {
  const { data: stats, error, isLoading, mutate } = useSWR('/admin/statistics', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  const refreshData = () => {
    mutate();
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
                <div className="h-6 w-6"></div>
              </div>
              <div className="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        ))}
      </div>

      {/* Additional Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
            <div className="flex items-center mb-4">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-2"></div>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center animate-pulse">
              <div className="h-10 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
            </div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-3"></div>
          </div>
        ))}
      </div>

      {/* Popular Exams Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mt-1"></div>
        </div>
        <div className="p-5 md:p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-lg animate-pulse mr-3"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="bg-red-50 p-4 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-medium mb-2">Error Loading Dashboard</p>
          <p className="text-red-600 text-sm mb-4">
            {error.response?.data?.message || 'Failed to load dashboard data. Please try again.'}
          </p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid - Only Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            {stats?.recentUsers > 0 && (
              <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.recentUsers}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalUsers?.toLocaleString() || 0}</h3>
          <p className="text-gray-600 text-sm">Total Users</p>
          {stats?.recentUsers > 0 && (
            <p className="text-xs text-green-600 mt-2">
              +{stats.recentUsers} this week
            </p>
          )}
        </div>

        {/* Total Exams Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalExams?.toLocaleString() || 0}</h3>
          <p className="text-gray-600 text-sm">Active Exams</p>
        </div>

        {/* Total Tests Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalTests?.toLocaleString() || 0}</h3>
          <p className="text-gray-600 text-sm">Available Tests</p>
        </div>

        {/* Test Attempts Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.totalTestAttempts?.toLocaleString() || 0}</h3>
          <p className="text-gray-600 text-sm">Test Attempts</p>
        </div>
      </div>

      {/* Additional Real Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Growth */}
        {stats?.recentUsers > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
            <div className="flex items-center mb-4">
              <UserPlus className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Recent User Growth</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-800">+{stats.recentUsers}</p>
              <p className="text-blue-600 text-sm">new users in the last 7 days</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {Math.round((stats.recentUsers / stats.totalUsers) * 100) || 0}% growth rate
            </p>
          </div>
        )}

        {/* Platform Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Platform Summary</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="text-sm font-medium">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Exams</span>
              <span className="text-sm font-medium">{stats?.totalExams || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available Tests</span>
              <span className="text-sm font-medium">{stats?.totalTests || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Test Attempts</span>
              <span className="text-sm font-medium">{stats?.totalTestAttempts || 0}</span>
            </div>
            {stats?.recentUsers > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recent Users (7 days)</span>
                <span className="text-sm font-medium text-green-600">+{stats.recentUsers}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Exams Section */}
      {stats?.popularExams?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Most Popular Exams</h2>
            <p className="text-sm text-gray-600 mt-1">Based on test attempts</p>
          </div>
          <div className="p-5 md:p-6">
            <div className="space-y-4">
              {stats.popularExams.map((exam, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-teal-800 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">{exam.name}</h4>
                    </div>
                  </div>
                  <div className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium">
                    {exam.attempts} attempts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State if no data */}
      {!stats?.totalUsers && !stats?.totalExams && !stats?.totalTests && !stats?.totalTestAttempts && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">There's no statistical data to display yet.</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;