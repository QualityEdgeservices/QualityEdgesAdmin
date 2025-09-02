import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import api from '../utils/api';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  X, 
  Save, 
  BookOpen, 
  Clock, 
  DollarSign, 
  List,
  Search,
  Filter,
  Loader
} from 'lucide-react';

// SWR fetcher function
const fetcher = (url) => api.get(url).then(res => res.data);

const Exams = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: 0,
    features: '',
    categories: {}
  });

  // State for category management
  const [categoryInputs, setCategoryInputs] = useState({
    categoryName: '',
    subCategoryName: '',
    subCategoryQuestions: '',
    subCategoryDuration: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, error, isLoading, mutate } = useSWR(
    '/exams',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const exams = data?.exams || [];

  // Filter exams based on search term
  const filteredExams = useMemo(() => {
    if (!searchTerm) return exams;
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    return exams.filter(exam => {
      return (
        exam.name.toLowerCase().includes(lowercasedSearchTerm) ||
        exam.description.toLowerCase().includes(lowercasedSearchTerm) ||
        exam.features.some(feature => 
          feature.toLowerCase().includes(lowercasedSearchTerm)
        ) ||
        exam.duration.toLowerCase().includes(lowercasedSearchTerm) ||
        exam.price.toString().includes(searchTerm)
      );
    });
  }, [exams, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/exams', {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        categories: formData.categories
      });
      setShowCreateForm(false);
      resetForm();
      mutate();
    } catch (error) {
      console.error('Failed to create exam:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/exams/${editingExam._id}`, {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        categories: formData.categories
      });
      setEditingExam(null);
      resetForm();
      mutate();
    } catch (error) {
      console.error('Failed to update exam:', error);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/admin/exams/${examId}`);
        mutate();
      } catch (error) {
        console.error('Failed to delete exam:', error);
      }
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      description: exam.description,
      duration: exam.duration,
      price: exam.price,
      features: exam.features.join(', '),
      categories: exam.categories || {}
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: 0,
      features: '',
      categories: {}
    });
    setCategoryInputs({
      categoryName: '',
      subCategoryName: '',
      subCategoryQuestions: '',
      subCategoryDuration: ''
    });
    setSelectedCategory('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new category
  const addCategory = () => {
    if (categoryInputs.categoryName.trim()) {
      const newCategory = categoryInputs.categoryName.trim();
      setFormData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [newCategory]: []
        }
      }));
      setCategoryInputs(prev => ({ ...prev, categoryName: '' }));
    }
  };

  // Add a sub-category to the selected category
  const addSubCategory = () => {
    if (selectedCategory && categoryInputs.subCategoryName.trim() && 
        categoryInputs.subCategoryQuestions && categoryInputs.subCategoryDuration) {
      
      const newSubCategory = {
        name: categoryInputs.subCategoryName.trim(),
        questions: parseInt(categoryInputs.subCategoryQuestions),
        duration: categoryInputs.subCategoryDuration
      };

      setFormData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [selectedCategory]: [
            ...(prev.categories[selectedCategory] || []),
            newSubCategory
          ]
        }
      }));

      setCategoryInputs(prev => ({
        ...prev,
        subCategoryName: '',
        subCategoryQuestions: '',
        subCategoryDuration: ''
      }));
    }
  };

  // Remove a category
  const removeCategory = (categoryName) => {
    const updatedCategories = { ...formData.categories };
    delete updatedCategories[categoryName];
    
    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Remove a sub-category
  const removeSubCategory = (categoryName, index) => {
    const updatedCategories = { ...formData.categories };
    updatedCategories[categoryName] = updatedCategories[categoryName].filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-80 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white shadow overflow-hidden rounded-xl">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="h-4 w-24 bg-gray-300 rounded-lg animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="bg-red-50 p-6 rounded-xl max-w-md text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-6 w-6" />
          </div>
          <p className="text-red-800 font-medium mb-2">Error Loading Exams</p>
          <p className="text-red-600 text-sm mb-4">
            {error.response?.data?.message || 'Failed to load exams. Please try again.'}
          </p>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Exams Management</h1>
          <p className="text-gray-600 mt-1">Create and manage examination content</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 justify-center transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Exam
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Create/Edit Form */}
          {(showCreateForm || editingExam) && (
            <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingExam ? 'Edit Exam' : 'Create New Exam'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingExam(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={editingExam ? handleUpdate : handleCreate} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <BookOpen className="h-4 w-4 inline mr-2 text-teal-600" />
                      Exam Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                      placeholder="Enter exam name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 inline mr-2 text-teal-600" />
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                      placeholder="e.g., 2 hours"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <DollarSign className="h-4 w-4 inline mr-2 text-teal-600" />
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <List className="h-4 w-4 inline mr-2 text-teal-600" />
                      Features (comma separated)
                    </label>
                    <input
                      type="text"
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Feature 1, Feature 2, ..."
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none"
                      required
                      placeholder="Enter exam description"
                    />
                  </div>
                </div>

                {/* Categories Management */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Categories Management</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Category */}
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Add Category</h5>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="categoryName"
                          value={categoryInputs.categoryName}
                          onChange={handleCategoryInputChange}
                          placeholder="Category name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addCategory}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Add Sub-Category */}
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Add Sub-Category</h5>
                      <div className="space-y-3">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="">Select Category</option>
                          {Object.keys(formData.categories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            name="subCategoryName"
                            value={categoryInputs.subCategoryName}
                            onChange={handleCategoryInputChange}
                            placeholder="Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            disabled={!selectedCategory}
                          />
                          <input
                            type="number"
                            name="subCategoryQuestions"
                            value={categoryInputs.subCategoryQuestions}
                            onChange={handleCategoryInputChange}
                            placeholder="Qty"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            disabled={!selectedCategory}
                          />
                          <input
                            type="text"
                            name="subCategoryDuration"
                            value={categoryInputs.subCategoryDuration}
                            onChange={handleCategoryInputChange}
                            placeholder="Duration"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            disabled={!selectedCategory}
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={addSubCategory}
                          className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={!selectedCategory}
                        >
                          Add Sub-Category
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Display Categories */}
                  <div className="mt-6 p-4 border border-gray-200 rounded-xl">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Current Categories</h5>
                    {Object.keys(formData.categories).length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No categories added yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(formData.categories).map(([categoryName, subCategories]) => (
                          <div key={categoryName} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-center mb-3">
                              <h6 className="font-medium text-gray-900">{categoryName}</h6>
                              <button
                                type="button"
                                onClick={() => removeCategory(categoryName)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {subCategories.length > 0 ? (
                              <div className="ml-4 space-y-2">
                                {subCategories.map((subCat, index) => (
                                  <div key={index} className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-700">
                                      {subCat.name} ({subCat.questions} questions, {subCat.duration})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeSubCategory(categoryName, index)}
                                      className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="ml-4 text-sm text-gray-500">No sub-categories added yet.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    {editingExam ? 'Update Exam' : 'Create Exam'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingExam(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Exams Table */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Exams</h3>
                <p className="text-sm text-gray-600 mt-1 sm:mt-0">
                  {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
                  {searchTerm && exams.length !== filteredExams.length && (
                    <span className="text-gray-400 ml-1">
                      (filtered from {exams.length} total)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-400 mb-2">
                          <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          {searchTerm 
                            ? `No exams found matching "${searchTerm}"` 
                            : 'No exams found'
                          }
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-teal-600 hover:text-teal-800 text-sm font-medium"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((exam) => (
                      <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                          <div className="text-sm text-gray-500 lg:hidden mt-1 line-clamp-2">
                            {exam.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                            {exam.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{exam.duration}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">₹{exam.price}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(exam)}
                              className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(exam._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Exams;