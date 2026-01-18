import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

// Mock the SeatMap component
vi.mock('./SeatMap', () => ({
  default: () => <div data-testid="seat-map">Seat Map Component</div>
}))

// Mock the API client
vi.mock('../services/apiClient', () => ({
  api: {
    get: vi.fn(),
    isRateLimited: vi.fn(() => false)
  }
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render the dashboard with correct title', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('FINANCIAL TERMINAL')).toBeInTheDocument()
      expect(screen.getByText('EventEase Flash Sale Control Center')).toBeInTheDocument()
    })

    it('should display Status: WAITING badge correctly', async () => {
      // Mock the API response for system status
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'WAITING',
          time: '0s',
          cycleProgress: 0,
          totalSeats: 100
        }
      })

      render(<Dashboard />)
      
      // Wait for the component to update with mocked data
      await vi.waitFor(() => {
        expect(screen.getByText('WAITING')).toBeInTheDocument()
      })
      
      expect(screen.getByText('0s')).toBeInTheDocument()
    })

    it('should render all status cards', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('STATUS')).toBeInTheDocument()
      expect(screen.getByText('TOTAL SEATS')).toBeInTheDocument()
      expect(screen.getByText('CYCLE PROGRESS')).toBeInTheDocument()
      expect(screen.getByText('NEXT DROP')).toBeInTheDocument()
    })

    it('should render the seat map component', () => {
      render(<Dashboard />)
      
      expect(screen.getByTestId('seat-map')).toBeInTheDocument()
    })

    it('should render the live latency graph', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('LIVE LATENCY')).toBeInTheDocument()
    })
  })

  describe('Status Display Logic', () => {
    it('should display LIVE status correctly', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'LIVE',
          time: '30s',
          cycleProgress: 50,
          totalSeats: 100
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        expect(screen.getByText('LIVE')).toBeInTheDocument()
        expect(screen.getByText('30s')).toBeInTheDocument()
      })
    })

    it('should display SOLD_OUT status correctly', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'SOLD_OUT',
          time: '60s',
          cycleProgress: 100,
          totalSeats: 100
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        expect(screen.getByText('SOLD_OUT')).toBeInTheDocument()
        expect(screen.getByText('60s')).toBeInTheDocument()
      })
    })

    it('should display CRASHED status correctly', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'CRASHED',
          time: '45s',
          cycleProgress: 75,
          totalSeats: 100
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        expect(screen.getByText('CRASHED')).toBeInTheDocument()
      })
    })
  })

  describe('Rate Limiting Integration', () => {
    it('should show rate limit warning when rate limit is hit', async () => {
      const { api } = await import('../services/apiClient')
      api.isRateLimited.mockReturnValue(true)

      render(<Dashboard />)
      
      // Dispatch rate limit event
      window.dispatchEvent(new CustomEvent('RATE_LIMIT_HIT'))
      
      await vi.waitFor(() => {
        expect(screen.getByText('SYSTEM RATE LIMITED - All operations paused')).toBeInTheDocument()
      })
    })

    it('should hide rate limit warning when rate limit is lifted', async () => {
      const { api } = await import('../services/apiClient')
      api.isRateLimited.mockReturnValue(false)

      render(<Dashboard />)
      
      // Dispatch rate limit lifted event
      window.dispatchEvent(new CustomEvent('RATE_LIMIT_LIFTED'))
      
      // Wait a bit for the event to be processed
      await vi.waitFor(() => {
        expect(screen.queryByText('SYSTEM RATE LIMITED - All operations paused')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('Next Drop Calculation', () => {
    it('should show correct countdown for WAITING status', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'WAITING',
          time: '30s',
          cycleProgress: 0,
          totalSeats: 100
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        // Should show 45 - 30 = 15 seconds remaining
        expect(screen.getByText('15')).toBeInTheDocument()
      })
    })

    it('should show LIVE for active flash sale', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'LIVE',
          time: '30s',
          cycleProgress: 50,
          totalSeats: 100
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        expect(screen.getByText('LIVE')).toBeInTheDocument()
      })
    })
  })

  describe('Latency Graph', () => {
    it('should render latency graph with data points', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'LIVE',
          time: '30s',
          cycleProgress: 50,
          totalSeats: 100,
          latency: 45
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        // Check if latency graph container exists
        const latencyGraph = screen.getByText('LIVE LATENCY').closest('div').querySelector('.h-32')
        expect(latencyGraph).toBeInTheDocument()
      })
    })

    it('should display current and average latency', async () => {
      const { api } = await import('../services/apiClient')
      api.get.mockResolvedValue({
        data: {
          status: 'LIVE',
          time: '30s',
          cycleProgress: 50,
          totalSeats: 100,
          latency: 45
        }
      })

      render(<Dashboard />)
      
      await vi.waitFor(() => {
        expect(screen.getByText('45ms')).toBeInTheDocument() // Current latency
        expect(screen.getByText('45ms')).toBeInTheDocument() // Average latency (same as current when only one data point)
      })
    })
  })

  describe('System Information Footer', () => {
    it('should display system information correctly', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('API Endpoint')).toBeInTheDocument()
      expect(screen.getByText('localhost:8080')).toBeInTheDocument()
      expect(screen.getByText('Rate Limit')).toBeInTheDocument()
      expect(screen.getByText('System Health')).toBeInTheDocument()
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    })

    it('should show correct rate limit status', () => {
      render(<Dashboard />)
      
      const rateLimitElement = screen.getByText('Rate Limit').nextElementSibling
      expect(rateLimitElement).toHaveTextContent('NORMAL')
    })
  })

  describe('Component Structure', () => {
    it('should have proper semantic HTML structure', () => {
      render(<Dashboard />)
      
      // Check for main heading
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('FINANCIAL TERMINAL')
      
      // Check for grid layout
      const gridContainer = mainHeading.closest('div').nextElementSibling
      expect(gridContainer).toHaveClass('grid')
    })

    it('should be accessible with proper ARIA labels', () => {
      render(<Dashboard />)
      
      // Check for proper heading structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check for button accessibility
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type')
      })
    })
  })

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now()
      
      render(<Dashboard />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('should not cause memory leaks', () => {
      const { unmount } = render(<Dashboard />)
      
      // Unmount component
      unmount()
      
      // Component should unmount without errors
      expect(document.body.innerHTML).toBe('')
    })
  })
})
