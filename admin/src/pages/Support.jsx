import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin
} from 'lucide-react';
import { User } from 'lucide-react';

const Support = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: BookOpen,
      questions: [
        {
          id: 'gs-1',
          question: 'How do I create my first exam?',
          answer: 'To create your first exam, navigate to the Exams section and click the "Create Exam" button. Fill in the required details such as exam title, description, and category. Once saved, you can add tests to your exam.'
        },
        {
          id: 'gs-2',
          question: 'How do I add students to my exam?',
          answer: 'You can add students by going to the Users section and either importing a list of students or manually adding them one by one. Once added, you can assign exams to specific students or groups.'
        },
        {
          id: 'gs-3',
          question: 'What types of questions can I create?',
          answer: 'Our platform supports multiple choice, true/false, short answer, and essay questions. You can also add images, formulas, and other media to your questions.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account Management',
      icon: User,
      questions: [
        {
          id: 'acc-1',
          question: 'How do I change my password?',
          answer: 'You can change your password in the Security section of your account settings. Click on "Change Password" and follow the prompts to update your password.'
        },
        {
          id: 'acc-2',
          question: 'How do I update my billing information?',
          answer: 'Billing information can be updated in the Billing section of your account. You can add, remove, or update payment methods as needed.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: HelpCircle,
      questions: [
        {
          id: 'ts-1',
          question: 'What should I do if a test is not loading?',
          answer: 'First, try refreshing the page. If the issue persists, check your internet connection and ensure that your browser is up to date. If problems continue, contact our support team.'
        },
        {
          id: 'ts-2',
          question: 'How do I recover lost data?',
          answer: 'Our system automatically backs up your data regularly. If you need to recover lost data, contact our support team with details about what was lost and when it occurred.'
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqCategories;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return faqCategories.map(category => ({
      ...category,
      questions: category.questions.filter(item => 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query)
      )
    })).filter(category => category.questions.length > 0);
  }, [searchQuery, faqCategories]);

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // If there's a search query, clear the active category to show all results
    if (e.target.value.trim()) {
      setActiveCategory('');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveCategory('getting-started');
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h1>
      <p className="text-gray-600 mb-8">Find answers to common questions or get in touch with our support team</p>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search help articles..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-gray-400 hover:text-gray-600">
                ×
              </span>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredFAQs.reduce((total, category) => total + category.questions.length, 0)} 
            results for "{searchQuery}"
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* FAQ Section */}
        <div className="lg:w-2/3">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
          </h2>
          
          {/* Category Navigation - Only show when not searching */}
          {!searchQuery && (
            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
              {faqCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${activeCategory === category.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((category) => (
                <div key={category.id}>
                  {/* Show category title when searching or when category is active */}
                  {(searchQuery || activeCategory === category.id) && (
                    <>
                      {searchQuery && (
                        <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                          <category.icon className="mr-2 h-4 w-4" />
                          {category.name}
                        </h3>
                      )}
                      {category.questions.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                          >
                            <span className="font-medium text-gray-900">{item.question}</span>
                            {openItems[item.id] ? (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                          {openItems[item.id] && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                              <p className="text-gray-600">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  We couldn't find any articles matching "{searchQuery}". Try different keywords or 
                  check out our contact options for direct support.
                </p>
              </div>
            )}
          </div>

          {/* Additional Resources - Only show when not searching */}
          {!searchQuery && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="#" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-teal-600 mr-3" />
                    <span className="font-medium text-gray-900">User Guide</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Comprehensive guide to all platform features</p>
                </a>
                <a href="#" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-teal-600 mr-3" />
                    <span className="font-medium text-gray-900">Video Tutorials</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Step-by-step video guides for common tasks</p>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Contact Details Section */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Support</h2>
            <p className="text-gray-600 mb-6">Get in touch with our support team through any of these channels:</p>

            <div className="space-y-6">
              {/* Email Support */}
              <div className="bg-teal-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-teal-800">Email Support</h3>
                    <p className="mt-1 text-sm text-teal-700">qualityedgeservice@gmail.com</p>
                    <p className="mt-2 text-xs text-teal-600">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Response time: Within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Support */}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Phone Support</h3>
                    <p className="mt-1 text-sm text-blue-700">+91 9250242736</p>
                    <p className="mt-2 text-xs text-blue-600">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Mon-Fri: 9AM-5PM EST
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Chat */}
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Live Chat</h3>
                    <p className="mt-1 text-sm text-green-700">Available on our website</p>
                    <p className="mt-2 text-xs text-green-600">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Mon-Fri: 9AM-6PM EST
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Address */}
              <div className="bg-purple-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-purple-800">Office Address</h3>
                    <p className="mt-1 text-sm text-purple-700">
                      Adarsh Nagar, Nabgram colony, Hooghly , West-Bengal, India , 712246
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;