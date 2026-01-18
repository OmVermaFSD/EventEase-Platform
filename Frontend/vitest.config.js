import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Vitest Configuration for EventEase Frontend
 * 
 * Features:
 * - React support with @vitejs/plugin-react
 * - Testing Library integration
 * - Coverage reporting with v8
 * - Path aliases for clean imports
 * - Environment setup for DOM testing
 */
export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.{js,ts}',
        '**/dist/**',
        '**/coverage/**',
        'src/main.jsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Test files pattern
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}'
    ],
    
    // Exclude files from testing
    exclude: [
      'node_modules/',
      'dist/',
      '.idea/',
      '.git/',
      'coverage/'
    ],
    
    // Setup files
    setupFiles: ['./src/test/setup.js'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Verbose output
    verbose: true,
    
    // Watch mode
    watch: false,
    
    // UI configuration
    ui: true,
    
    // Reporter configuration
    reporter: ['verbose', 'html', 'json'],
    
    // Global variables
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:8080/api'
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      '@test': resolve(__dirname, './src/test')
    }
  },
  
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __TEST__: JSON.stringify(true)
  }
})
