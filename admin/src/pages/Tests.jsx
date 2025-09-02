import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../utils/api';
import * as XLSX from 'xlsx';
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
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// SWR fetcher function
const fetcher = (url) => api.get(url).then(res => res.data);

const Tests = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    examId: '',
    title: '',
    description: '',
    duration: '',
    totalQuestions: '',
    category: 'Set Wise',
    isFree: false,
    price: 0,
    questions: []
  });
  const [importMethod, setImportMethod] = useState('manual');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  // SWR hooks for data fetching
  const { data: testsData, error: testsError, isLoading: testsLoading, mutate: mutateTests } = useSWR(
    '/admin/tests',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const { data: examsData, error: examsError, isLoading: examsLoading } = useSWR(
    '/exams',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const tests = testsData || [];
  const exams = examsData?.exams || [];

  // Filter tests based on search term
  const filteredTests = tests.filter(test => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const examName = exams.find(e => e._id === test.examId)?.name || '';
    
    return (
      test.title.toLowerCase().includes(searchLower) ||
      test.description.toLowerCase().includes(searchLower) ||
      examName.toLowerCase().includes(searchLower) ||
      test.category.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/tests', formData);
      setShowCreateForm(false);
      resetForm();
      mutateTests();
    } catch (error) {
      console.error('Failed to create test:', error);
      alert(`Failed to create test: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/tests/${editingTest._id}`, formData);
      setEditingTest(null);
      resetForm();
      mutateTests();
    } catch (error) {
      console.error('Failed to update test:', error);
      alert(`Failed to update test: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await api.delete(`/admin/tests/${testId}`);
        mutateTests();
      } catch (error) {
        console.error('Failed to delete test:', error);
        alert(`Failed to delete test: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      examId: test.examId,
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      category: test.category,
      isFree: test.isFree,
      price: test.price,
      questions: test.questions
    });
    setImportMethod('manual');
    setShowCreateForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      examId: '',
      title: '',
      description: '',
      duration: '',
      totalQuestions: '',
      category: 'Set Wise',
      isFree: false,
      price: 0,
      questions: []
    });
    setImportMethod('manual');
    setFile(null);
    setParsedData([]);
  };

  // Manual question methods
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        subject: 'Quant',
        difficulty: 'Medium',
        marks: 1
      }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options[oIndex] = value;
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // File import methods
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setIsParsing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        processImportedData(jsonData);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format.');
      } finally {
        setIsParsing(false);
      }
    };
    
    reader.readAsArrayBuffer(uploadedFile);
  };

  const processImportedData = (data) => {
    const processedQuestions = data.map((row, index) => {
      return {
        question: row.question || row.Question || row.QUESTION || '',
        options: [
          row.option1 || row.Option1 || row.OPTION1 || '',
          row.option2 || row.Option2 || row.OPTION2 || '',
          row.option3 || row.Option3 || row.OPTION3 || '',
          row.option4 || row.Option4 || row.OPTION4 || ''
        ],
        correctAnswer: parseInt(row.correctAnswer || row.CorrectAnswer || row.CORRECTANSWER || 0),
        explanation: row.explanation || row.Explanation || row.EXPLANATION || '',
        subject: row.subject || row.Subject || row.SUBJECT || 'Quant',
        difficulty: row.difficulty || row.Difficulty || row.DIFFICULTY || 'Medium',
        marks: parseInt(row.marks || row.Marks || row.MARKS || 1)
      };
    });
    
    setParsedData(processedQuestions);
  };

  const useImportedQuestions = () => {
    setFormData(prev => ({
      ...prev,
      questions: parsedData,
      totalQuestions: parsedData.length.toString()
    }));
    setImportMethod('manual');
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        question: "Sample question text?",
        option1: "Option 1",
        option2: "Option 2",
        option3: "Option 3",
        option4: "Option 4",
        correctAnswer: 0,
        explanation: "Explanation for the correct answer",
        subject: "Quant",
        difficulty: "Medium",
        marks: 1
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "question_import_template.xlsx");
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
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="h-4 w-24 bg-gray-300 rounded-lg animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
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

  if (testsError || examsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-12">
        <div className="bg-red-50 p-6 rounded-xl max-w-md text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-red-800 font-medium mb-2">Error Loading Data</p>
          <p className="text-red-600 text-sm mb-4">
            {testsError?.response?.data?.message || examsError?.response?.data?.message || 'Failed to load data. Please try again.'}
          </p>
          <button
            onClick={() => {
              mutateTests();
              window.location.reload();
            }}
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tests Management</h1>
          <p className="text-gray-600 mt-1">Create and manage test content</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tests..."
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
            Create Test
          </button>
        </div>
      </div>

      {testsLoading || examsLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Create/Edit Form */}
          {(showCreateForm || editingTest) && (
            <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTest ? 'Edit Test' : 'Create New Test'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTest(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={editingTest ? handleUpdate : handleCreate} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <BookOpen className="h-4 w-4 inline mr-2 text-teal-600" />
                      Exam
                    </label>
                    <select
                      name="examId"
                      value={formData.examId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Select Exam</option>
                      {exams.map(exam => (
                        <option key={exam._id} value={exam._id}>{exam.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                      placeholder="Test title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 inline mr-2 text-teal-600" />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Questions
                    </label>
                    <input
                      type="number"
                      name="totalQuestions"
                      value={formData.totalQuestions}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    >
                      <option value="Set Wise">Set Wise</option>
                      <option value="Subject Wise">Subject Wise</option>
                      <option value="Topic Wise">Topic Wise</option>
                    </select>
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
                      disabled={formData.isFree}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="block text-sm text-gray-900">Free Test</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Test description"
                  />
                </div>

                {/* Questions Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Questions</h4>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Template
                      </button>
                      
                      {importMethod === 'manual' ? (
                        <button
                          type="button"
                          onClick={() => setImportMethod('file')}
                          className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Import
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setImportMethod('manual')}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          Manual
                        </button>
                      )}
                      
                      {importMethod === 'manual' && (
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Question
                        </button>
                      )}
                    </div>
                  </div>

                  {importMethod === 'file' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-4">
                      <h5 className="font-medium mb-3 text-gray-900">Import Questions from Excel/CSV</h5>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload an Excel file with questions. Required columns: question, option1, option2, option3, option4, correctAnswer (0-3)
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition-colors"
                          />
                          
                          {isParsing && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {parsedData.length > 0 && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700 mb-3">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Successfully parsed {parsedData.length} questions</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={useImportedQuestions}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Use These Questions
                          </button>
                          
                          <div className="mt-4 max-h-48 overflow-y-auto">
                            <h6 className="text-sm font-medium mb-2 text-gray-700">Preview (first 5 questions):</h6>
                            {parsedData.slice(0, 5).map((q, i) => (
                              <div key={i} className="text-xs border-b border-green-100 py-2">
                                <p className="font-medium">Q{i+1}: {q.question.substring(0, 60)}...</p>
                                <p className="text-gray-600">Correct: Option {q.correctAnswer + 1}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {formData.questions.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No questions added yet</p>
                          <p className="text-sm text-gray-400 mt-1">Add questions manually or import from file</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.questions.map((question, qIndex) => (
                            <div key={qIndex} className="border rounded-xl p-5 bg-gray-50">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="font-medium text-gray-900">Question {qIndex + 1}</h5>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(qIndex)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                  <textarea
                                    value={question.question}
                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {question.options.map((option, oIndex) => (
                                      <div key={oIndex} className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 w-6">{oIndex + 1}.</span>
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                          placeholder={`Option ${oIndex + 1}`}
                                          required
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                    <select
                                      value={question.correctAnswer}
                                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                      required
                                    >
                                      <option value={0}>Option 1</option>
                                      <option value={1}>Option 2</option>
                                      <option value={2}>Option 3</option>
                                      <option value={3}>Option 4</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select
                                      value={question.subject}
                                      onChange={(e) => updateQuestion(qIndex, 'subject', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                    >
                                      <option value="Quant">Quant</option>
                                      <option value="English">English</option>
                                      <option value="Reasoning">Reasoning</option>
                                      <option value="GK">GK</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                    <select
                                      value={question.difficulty}
                                      onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                    >
                                      <option value="Easy">Easy</option>
                                      <option value="Medium">Medium</option>
                                      <option value="Hard">Hard</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                                  <textarea
                                    value={question.explanation}
                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                    placeholder="Explanation for the correct answer"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    {editingTest ? 'Update Test' : 'Create Test'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTest(null);
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

          {/* Tests Table */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Tests</h3>
                <p className="text-sm text-gray-600 mt-1 sm:mt-0">
                  {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
                  {searchTerm && tests.length !== filteredTests.length && (
                    <span className="text-gray-400 ml-1">
                      (filtered from {tests.length} total)
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
                      Test
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
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
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="text-gray-400 mb-2">
                          <BookOpen className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          {searchTerm 
                            ? `No tests found matching "${searchTerm}"` 
                            : 'No tests found'
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
                    filteredTests.map((test) => (
                      <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{test.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                            {test.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {exams.find(e => e._id === test.examId)?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{test.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{test.totalQuestions}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{test.duration} mins</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(test)}
                              className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(test._id)}
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

export default Tests;