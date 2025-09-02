// pages/Users.js
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import api from '../utils/api';
import { Edit3, Save, X, Mail, Phone, User, CheckCircle, Clock, Search } from 'lucide-react';

// SWR fetcher function
const fetcher = (url) => api.get(url).then(res => res.data);

const Users = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/users?page=${currentPage}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // Get all users for client-side filtering
  const allUsers = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const totalUsersFromAPI = data?.users.length || 0;

  // Filter users based on search term (client-side)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    
    return allUsers.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  // Calculate pagination for filtered results
  const totalUsers = filteredUsers.length;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredUsers.slice(startIndex, startIndex + limit);
  }, [filteredUsers, currentPage, limit]);

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${editingUser._id}`, editingUser);
      setEditingUser(null);
      mutate(); // Refresh the data using SWR's mutate
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate total pages for filtered results
  const filteredTotalPages = Math.ceil(totalUsers / limit);

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(5)].map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="bg-red-50 p-4 rounded-lg max-w-md text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-6 w-6" />
          </div>
          <p className="text-red-800 font-medium mb-2">Error Loading Users</p>
          <p className="text-red-600 text-sm mb-4">
            {error.response?.data?.message || 'Failed to load users. Please try again.'}
          </p>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage and view all registered users</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Table Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">All Users</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-1 sm:mt-0">
                <p className="text-sm text-gray-600">
                  {searchTerm ? `${totalUsers} filtered` : `${totalUsersFromAPI} total`} user{totalUsers !== 1 ? 's' : ''}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-teal-600 hover:text-teal-800 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    {/* User Info */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="ml-4">
                          {editingUser && editingUser._id === user._id ? (
                            <input
                              type="text"
                              name="name"
                              value={editingUser.name}
                              onChange={handleChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                              placeholder="Name"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          )}
                          <div className="text-sm text-gray-500 sm:hidden">
                            <div className="flex items-center mt-1">
                              <Mail className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                            {user.mobile && (
                              <div className="flex items-center mt-1">
                                <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                <span>{user.mobile}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info - Hidden on mobile */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.mobile && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {user.mobile}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isVerified ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs font-medium text-green-800">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-xs font-medium text-yellow-800">Pending</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser && editingUser._id === user._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-teal-600 hover:text-teal-900 p-1 rounded-full hover:bg-teal-50"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <User className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search term' : 'No users have registered yet'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {paginatedUsers.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * limit, totalUsers)}</span> of{' '}
                    <span className="font-medium">{totalUsers}</span> users
                    {searchTerm && ' (filtered)'}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {filteredTotalPages || 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, filteredTotalPages))}
                      disabled={currentPage === filteredTotalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;