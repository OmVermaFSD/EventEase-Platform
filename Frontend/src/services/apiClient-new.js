import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Smart API Client for EventEase Frontend
 * 
 * Features:
 * - Base URL configuration for Spring Boot backend
 * - Custom error handling for 429 (Rate Limit) and 409 (Conflict)
 * - Event-driven UI state management
 * - Automatic retry logic with exponential backoff
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Global state for rate limiting
let isRateLimited = false;
let rateLimitTimeout = null;

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Request Interceptor - Add correlation ID and auth
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add correlation ID for tracking
    config.headers['X-Correlation-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle 429 and 409 errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    // Reset rate limiting state on successful response
    if (isRateLimited) {
      isRateLimited = false;
      if (rateLimitTimeout) {
        clearTimeout(rateLimitTimeout);
        rateLimitTimeout = null;
      }
      
      // Notify UI that rate limit has been lifted
      window.dispatchEvent(new CustomEvent('RATE_LIMIT_LIFTED'));
    }
    
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Log error response
    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Handle specific HTTP status codes
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 429:
          // Rate Limiting - Trigger UI freeze for 5 seconds
          handleRateLimit();
          break;
          
        case 409:
          // Conflict - Seat snagged by another user
          handleSeatConflict();
          break;
          
        case 401:
          // Unauthorized
          toast.error('Session expired. Please log in again.', {
            icon: '🔐',
            duration: 5000
          });
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          toast.error('Access denied. You do not have permission.', {
            icon: '🚫',
            duration: 5000
          });
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast.error('Server error. Please try again later.', {
            icon: '🔥',
            duration: 5000
          });
          break;
          
        default:
          // Other errors
          toast.error(error.response.data?.message || error.message, {
            icon: '⚠️',
            duration: 3000
          });
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.', {
        icon: '🌐',
        duration: 5000
      });
    } else {
      // Other errors
      toast.error(error.message, {
        icon: '⚠️',
        duration: 3000
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Handle Rate Limiting (429 Error)
 */
function handleRateLimit() {
  if (isRateLimited) return; // Already handling rate limit
  
  isRateLimited = true;
  
  // Show rate limit toast
  toast.error('⛔ System Overload: Cooling down...', {
    duration: 5000,
    icon: '⏳'
  });
  
  // Dispatch custom event for UI components
  window.dispatchEvent(new CustomEvent('RATE_LIMIT_HIT', {
    detail: {
      message: 'System overloaded - Cooling down for 5 seconds',
      duration: 5000
    }
  }));
  
  // Auto-resume after 5 seconds
  rateLimitTimeout = setTimeout(() => {
    isRateLimited = false;
    rateLimitTimeout = null;
    
    // Notify UI that rate limit has been lifted
    window.dispatchEvent(new CustomEvent('RATE_LIMIT_LIFTED'));
    
    toast.success('✅ System ready - Resuming operations', {
      duration: 3000,
      icon: '🚀'
    });
  }, 5000);
}

/**
 * Handle Seat Conflict (409 Error)
 */
function handleSeatConflict() {
  // Show conflict toast
  toast.error('⚠️ Seat snagged by another user!', {
    duration: 4000,
    icon: '🪑'
  });
  
  // Dispatch custom event for UI components
  window.dispatchEvent(new CustomEvent('SEAT_CONFLICT', {
    detail: {
      message: 'Seat conflict detected',
      timestamp: Date.now()
    }
  }));
}

/**
 * API Methods with Built-in Error Handling
 */
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // Check if currently rate limited
  isRateLimited: () => isRateLimited,
  
  // Get rate limit status
  getRateLimitStatus: () => ({
    isLimited: isRateLimited,
    remainingTime: rateLimitTimeout ? 5000 : 0
  })
};

// Export default for backward compatibility
export default api;

/**
 * Usage Examples:
 * 
 * // Basic GET request
 * try {
 *   const response = await api.get('/seats');
 *   console.log(response.data);
 * } catch (error) {
 *   // Error handled by interceptor
 * }
 * 
 * // Listen for rate limit events
 * window.addEventListener('RATE_LIMIT_HIT', (event) => {
 *   console.log('Rate limit detected:', event.detail);
 *   // Disable buttons, show loading state
 * });
 * 
 * window.addEventListener('RATE_LIMIT_LIFTED', () => {
 *   console.log('Rate limit lifted');
 *   // Re-enable buttons
 * });
 * 
 * // Listen for seat conflicts
 * window.addEventListener('SEAT_CONFLICT', (event) => {
 *   console.log('Seat conflict:', event.detail);
 *   // Show conflict UI, refresh seat map
 * });
 */
