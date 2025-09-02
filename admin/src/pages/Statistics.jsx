// pages/Statistics.js
import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  Download,
  Mail,
  MessageSquare,
  Brain,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// SWR fetcher function
const fetcher = url => api.get(url).then(res => res.data);

// Skeleton components
const StatCardSkeleton = () => (
  <div className="bg-white overflow-hidden shadow rounded-lg p-4 md:p-6 animate-pulse">
    <div className="flex items-center">
      <div className="flex-shrink-0 bg-gray-200 rounded-md p-3">
        <div className="h-6 w-6 bg-gray-300 rounded"></div>
      </div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white shadow rounded-lg p-4 md:p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="h-64 bg-gray-100 rounded"></div>
  </div>
);

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Fetch statistics data with SWR
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR(
    '/admin/statistics', 
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  );
  
  // Generate time-based data
  const generateTimeBasedData = (range) => {
    let labels = [];
    let userData = [];
    let revenueDataPoints = [];
    
    switch(range) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        userData = [45, 52, 48, 65, 70, 85, 90];
        revenueDataPoints = [2500, 3200, 2800, 4100, 5200, 6800, 7500];
        break;
      case 'month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        userData = [180, 220, 260, 310];
        revenueDataPoints = [12500, 15800, 19200, 23500];
        break;
      case 'quarter':
        labels = ['Month 1', 'Month 2', 'Month 3'];
        userData = [850, 1120, 1450];
        revenueDataPoints = [52000, 68500, 89200];
        break;
      case 'year':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        userData = [450, 520, 580, 640, 720, 850, 920, 1050, 1180, 1320, 1480, 1650];
        revenueDataPoints = [22500, 26500, 31200, 35800, 42500, 48500, 54200, 61500, 68200, 75800, 83500, 92500];
        break;
      default:
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        userData = [180, 220, 260, 310];
        revenueDataPoints = [12500, 15800, 19200, 23500];
    }
    
    return {
      userGrowthData: {
        labels,
        datasets: [
          {
            label: 'New Users',
            data: userData,
            borderColor: 'rgb(13, 148, 136)',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      revenueData: {
        labels,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: revenueDataPoints,
            backgroundColor: 'rgba(13, 148, 136, 0.7)',
            borderRadius: 5,
          },
        ],
      }
    };
  };

  const { userGrowthData, revenueData } = generateTimeBasedData(timeRange);

  // Chart data for test attempts by subject
  const testAttemptsData = {
    labels: ['Quantitative Aptitude', 'English Language', 'General Awareness', 'Logical Reasoning', 'Current Affairs'],
    datasets: [
      {
        label: 'Test Attempts',
        data: stats?.subjectAttempts || [1560, 1240, 980, 1320, 870],
        backgroundColor: [
          'rgba(13, 148, 136, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(45, 212, 191, 0.8)',
          'rgba(94, 234, 212, 0.8)',
          'rgba(153, 246, 228, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for average scores
  const averageScoresData = {
    labels: ['Quantitative Aptitude', 'English Language', 'General Awareness', 'Logical Reasoning'],
    datasets: [
      {
        label: 'Average Score (%)',
        data: stats?.averageScores || [68, 72, 65, 70],
        backgroundColor: 'rgba(13, 148, 136, 0.5)',
        borderRadius: 5,
      },
    ],
  };

  // Quick action handlers
  const handleExportReports = async () => {
    try {
      const response = await api.get('/admin/export-reports', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reports.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export reports:', error);
    }
  };

  const handleSendNewsletter = async () => {
    try {
      await api.post('/admin/send-newsletter');
      alert('Newsletter sent successfully!');
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      alert('Failed to send newsletter');
    }
  };

  if (statsError) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load statistics</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</dd>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    +{stats?.recentUsers || 0} this week
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Exams</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.totalExams || 0}</dd>
                  <p className="text-xs text-gray-500 mt-1">
                    Across all categories
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                  <FileText className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Tests</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.totalTests || 0}</dd>
                  <p className="text-xs text-gray-500 mt-1">
                    Practice & mock tests
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Test Attempts</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.totalTestAttempts || 0}</dd>
                  <p className="text-xs text-gray-500 mt-1">
                    Total completed tests
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {statsLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
              <div className="h-64">
                {userGrowthData.labels && (
                  <Line 
                    data={userGrowthData} 
                    options={{ 
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Attempts by Subject</h3>
              <div className="h-64">
                <Doughnut 
                  data={testAttemptsData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {statsLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview (₹)</h3>
              <div className="h-64">
                {revenueData.labels && (
                  <Bar 
                    data={revenueData} 
                    options={{ 
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString();
                            }
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Average Scores by Subject</h3>
              <div className="h-64">
                <Bar 
                  data={averageScoresData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Popular Exams */}
        <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Most Popular Exams</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {statsLoading ? (
              <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {stats?.popularExams?.length > 0 ? (
                  stats.popularExams.map((exam, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-teal-600 font-medium mr-2">{index + 1}.</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{exam.name}</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {exam.attempts} attempts
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-center text-gray-500">No exam data available</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Platform Metrics</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {statsLoading ? (
              <div className="animate-pulse grid grid-cols-1 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-gray-500">Average Test Completion Rate</dt>
                  <dd className="text-sm font-semibold text-gray-900">78%</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-gray-500">User Retention Rate</dt>
                  <dd className="text-sm font-semibold text-gray-900">62%</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-gray-500">Avg. Time per Test (mins)</dt>
                  <dd className="text-sm font-semibold text-gray-900">42</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-gray-500">Peak Usage Hours</dt>
                  <dd className="text-sm font-semibold text-gray-900">7-10 PM</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-gray-500">Mobile vs Desktop</dt>
                  <dd className="text-sm font-semibold text-gray-900">68% vs 32%</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-teal-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-teal-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleExportReports}
            className="bg-white text-teal-700 border border-teal-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Reports
          </button>
          <button 
            onClick={handleSendNewsletter}
            className="bg-white text-teal-700 border border-teal-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Newsletter
          </button>
          <button className="bg-white text-teal-700 border border-teal-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" />
            View Feedback
          </button>
          <button className="bg-teal-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
            <Brain className="h-4 w-4" />
            Generate Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Statistics;