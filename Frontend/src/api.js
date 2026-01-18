import axios from 'axios';

/**
 * Smart Network Layer for EventEase Flash Sale Terminal
 * 
 * Features:
 * - Axios with interceptors for 429/409 error handling
 * - Reactive system overload state
 * - Specific error messages for seat conflicts
 */

// Reactive state for system overload
let isSystemOverloaded = false;

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 429) {
        // System overloaded - set reactive state
        isSystemOverloaded = true;
        setTimeout(() => {
          isSystemOverloaded = false;
        }, 5000); // Reset after 5 seconds
        
        return Promise.reject(error);
      }
      
      if (status === 409) {
        // Seat conflict - return specific error
        return Promise.reject(new Error('Seat taken!'));
      }
    }
    
    return Promise.reject(error);
  }
);

// Export reactive state and API methods
export { isSystemOverloaded };
export default api;
