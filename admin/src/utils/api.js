// // utils/api.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_APP_URL}/api`,
// });

// // Add a request interceptor to include the auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor to handle auth errors
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       // Clear invalid token
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       delete api.defaults.headers.common['Authorization'];
      
//       // Redirect to login if we're not already there
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

// utils/api.js
import axios from 'axios';

let authToken = null; // keep token in memory, not localStorage

const api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_URL}/api`,
});

// Allow AuthContext to set token here
export const setAuthToken = (token) => {
  authToken = token;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid token
      authToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
