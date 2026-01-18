import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Smart API Client with Resiliency Features
 * 
 * Features:
 * - Request/Response Interceptors for global error handling
 * - Rate Limiting Detection and Backpressure Handling
 * - Automatic Retry with Exponential Backoff
 * - Circuit Breaker Pattern Implementation
 * - Request Cancellation for Component Unmount
 * - Request/Response Logging for Debugging
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Circuit Breaker State
let circuitBreakerState = {
  failures: 0,
  lastFailureTime: null,
  state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
  threshold: 5, // Open circuit after 5 failures
  timeout: 60000 // Reset circuit after 60 seconds
};

// Rate Limiting State
let rateLimitState = {
  isRateLimited: false,
  resetTime: null,
  retryAfter: null
};

// Request Queue for Rate Limiting
const requestQueue = [];
let isProcessingQueue = false;

/**
 * Create Axios Instance with Default Configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

/**
 * Circuit Breaker Logic
 */
const checkCircuitBreaker = () => {
  const now = Date.now();
  
  if (circuitBreakerState.state === 'OPEN') {
    if (now - circuitBreakerState.lastFailureTime > circuitBreakerState.timeout) {
      circuitBreakerState.state = 'HALF_OPEN';
      console.log('🔄 Circuit breaker moving to HALF_OPEN state');
    } else {
      return false; // Circuit is still open
    }
  }
  
  return true; // Circuit is closed or half-open
};

const recordSuccess = () => {
  circuitBreakerState.failures = 0;
  circuitBreakerState.state = 'CLOSED';
};

const recordFailure = () => {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();
  
  if (circuitBreakerState.failures >= circuitBreakerState.threshold) {
    circuitBreakerState.state = 'OPEN';
    console.warn('⚠️ Circuit breaker OPENED due to repeated failures');
  }
};

/**
 * Rate Limiting Handler
 */
const handleRateLimit = (response) => {
  const retryAfter = response.headers['retry-after'];
  const resetTime = response.headers['x-ratelimit-reset'];
  
  rateLimitState.isRateLimited = true;
  rateLimitState.retryAfter = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
  rateLimitState.resetTime = resetTime ? new Date(resetTime * 1000) : new Date(Date.now() + rateLimitState.retryAfter);
  
  console.warn('🚦 Rate limit detected. Cooling down...', {
    retryAfter: rateLimitState.retryAfter,
    resetTime: rateLimitState.resetTime
  });
  
  // Show user-friendly message
  toast.error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitState.retryAfter / 1000)} seconds...`, {
    duration: rateLimitState.retryAfter,
    icon: '⏳'
  });
  
  // Trigger UI cooling down action
  window.dispatchEvent(new CustomEvent('rateLimitDetected', {
    detail: {
      retryAfter: rateLimitState.retryAfter,
      resetTime: rateLimitState.resetTime
    }
  }));
};

/**
 * Exponential Backoff Delay Calculator
 */
const getRetryDelay = (attemptNumber) => {
  return RETRY_DELAY_BASE * Math.pow(2, attemptNumber) + Math.random() * 1000;
};

/**
 * Request Queue Processor
 */
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { config, resolve, reject } = requestQueue.shift();
    
    try {
      const response = await apiClient(config);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  }
  
  isProcessingQueue = false;
};

/**
 * Request Interceptor
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    // Add correlation ID for tracing
    config.headers['X-Correlation-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request
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
 * Response Interceptor with Smart Error Handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata?.startTime;
    
    // Log successful response
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      duration: `${duration}ms`,
      data: response.data
    });
    
    // Record success for circuit breaker
    recordSuccess();
    
    // Reset rate limiting state on successful response
    if (rateLimitState.isRateLimited) {
      rateLimitState.isRateLimited = false;
      rateLimitState.resetTime = null;
      rateLimitState.retryAfter = null;
      console.log('✅ Rate limit reset. Resuming normal operations.');
      
      // Notify UI that rate limit has been lifted
      window.dispatchEvent(new CustomEvent('rateLimitReset'));
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Calculate request duration
    const duration = Date.now() - originalRequest?.metadata?.startTime;
    
    // Log error response
    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      message: error.message,
      duration: `${duration}ms`,
      data: error.response?.data
    });
    
    // Handle specific HTTP status codes
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 429: // Too Many Requests - Rate Limiting
          handleRateLimit(error.response);
          recordFailure();
          
          // Queue the request for retry after rate limit
          return new Promise((resolve, reject) => {
            requestQueue.push({
              config: originalRequest,
              resolve,
              reject
            });
            
            // Process queue after rate limit reset
            setTimeout(() => {
              processRequestQueue();
            }, rateLimitState.retryAfter);
          });
          
        case 500: // Internal Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          recordFailure();
          
          // Check circuit breaker
          if (!checkCircuitBreaker()) {
            toast.error('Service temporarily unavailable. Please try again later.', {
              icon: '🔌',
              duration: 5000
            });
            return Promise.reject(new Error('Circuit breaker is OPEN'));
          }
          
          // Retry with exponential backoff
          if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
          }
          
          if (originalRequest._retryCount < MAX_RETRIES) {
            originalRequest._retryCount++;
            const delay = getRetryDelay(originalRequest._retryCount);
            
            console.log(`🔄 Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) after ${delay}ms`);
            
            toast.loading(`Retrying... (${originalRequest._retryCount}/${MAX_RETRIES})`, {
              id: 'retry-toast'
            });
            
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(apiClient(originalRequest));
              }, delay);
            });
          } else {
            toast.error('Request failed after multiple retries. Please try again later.', {
              icon: '❌',
              duration: 5000
            });
          }
          break;
          
        case 401: // Unauthorized
          toast.error('Session expired. Please log in again.', {
            icon: '🔐',
            duration: 5000
          });
          
          // Clear auth token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
          
        case 403: // Forbidden
          toast.error('Access denied. You do not have permission to perform this action.', {
            icon: '🚫',
            duration: 5000
          });
          break;
          
        case 404: // Not Found
          toast.error('The requested resource was not found.', {
            icon: '🔍',
            duration: 3000
          });
          break;
          
        default:
          toast.error(`Request failed: ${error.response.data?.message || error.message}`, {
            icon: '⚠️',
            duration: 3000
          });
      }
    } else if (error.request) {
      // Network error (no response received)
      recordFailure();
      toast.error('Network error. Please check your connection and try again.', {
        icon: '🌐',
        duration: 5000
      });
    } else {
      // Other errors (request configuration, etc.)
      toast.error(`Request error: ${error.message}`, {
        icon: '⚠️',
        duration: 3000
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Methods with Built-in Resiliency
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
  
  // Custom request with full control
  request: (config) => apiClient(config),
  
  // Circuit breaker status for UI monitoring
  getCircuitBreakerStatus: () => circuitBreakerState,
  
  // Rate limit status for UI monitoring
  getRateLimitStatus: () => rateLimitState,
  
  // Cancel request by URL
  cancelRequest: (url) => {
    const cancelTokenSource = axios.CancelToken.source();
    cancelTokenSource.cancel(`Request to ${url} was cancelled`);
    return cancelTokenSource;
  }
};

// Export default for backward compatibility
export default api;

/**
 * Usage Examples:
 * 
 * // Simple GET request
 * const response = await api.get('/events');
 * 
 * // POST request with data
 * const result = await api.post('/bookings', { seatId: 'A1' });
 * 
 * // Monitor circuit breaker status
 * const status = api.getCircuitBreakerStatus();
 * if (status.state === 'OPEN') {
 *   // Show degraded UI
 * }
 * 
 * // Listen for rate limit events
 * window.addEventListener('rateLimitDetected', (event) => {
 *   console.log('Rate limit detected:', event.detail);
 *   // Show cooling down UI
 * });
 */
