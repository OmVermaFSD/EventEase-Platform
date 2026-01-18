/**
 * Vitest Setup File for EventEase Frontend
 * 
 * This file runs before each test and sets up:
 * - Testing Library globals
 * - Mock implementations
 * - Global test utilities
 * - Environment configuration
 */

// Import Testing Library
import '@testing-library/jest-dom'

// Import custom matchers
import { expect } from 'vitest'

// Custom matchers for better test assertions
expect.extend({
  toBeInTheDocument(received) {
    const pass = received && document.body.contains(received)
    return {
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
      pass,
    }
  },
  
  toHaveClass(received, className) {
    const pass = received && received.classList && received.classList.contains(className)
    return {
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
      pass,
    }
  },
  
  toBeVisible(received) {
    const pass = received && 
      received.offsetWidth > 0 && 
      received.offsetHeight > 0 &&
      getComputedStyle(received).display !== 'none' &&
      getComputedStyle(received).visibility !== 'hidden'
    
    return {
      message: () =>
        pass
          ? `expected element not to be visible`
          : `expected element to be visible`,
      pass,
    }
  }
})

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver for responsive components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo for scroll-related tests
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch for API testing
global.fetch = vi.fn()

// Mock console methods for cleaner test output
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
  
  // Restore console methods
  console.error = originalError
  console.warn = originalWarn
})

// Global test utilities
global.testUtils = {
  // Create a mock event
  createEvent: (type, data = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true })
    Object.assign(event, data)
    return event
  },
  
  // Create a mock component with props
  createMockComponent: (props = {}) => {
    return {
      props,
      render: vi.fn(),
      componentDidMount: vi.fn(),
      componentWillUnmount: vi.fn(),
    }
  },
  
  // Wait for next tick
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Wait for component update
  waitForUpdate: () => new Promise(resolve => setTimeout(resolve, 100)),
  
  // Mock API response
  mockApiResponse: (data, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
  },
  
  // Mock API error
  mockApiError: (message, status = 500) => {
    return Promise.reject({
      response: {
        status,
        data: { message }
      }
    })
  }
}

// Set up global test environment
global.testEnvironment = {
  isTest: true,
  isDevelopment: false,
  isProduction: false
}

// Mock CSS-in-JS for testing
global.CSS = {
  supports: vi.fn(() => false),
  escape: vi.fn(),
  supportsProperty: vi.fn(),
  supportsValue: vi.fn()
}

// Mock getComputedStyle for style testing
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(),
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
  }))
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock performance.now for timing tests
Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => Date.now())
})

// Export for use in test files if needed
export { vi }
