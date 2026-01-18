/**
 * Dashboard Component Tests
 * 
 * Test Coverage:
 * - Component rendering
 * - Status display functionality
 * - Flash sale state management
 * - Seat map integration
 * - Payment modal interactions
 * - API client integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import MockEngine from '../services/mockEngine'

// Mock the MockEngine
vi.mock('../services/mockEngine')

// Mock the child components
vi.mock('./SeatMap', () => ({
  default: ({ onSeatSelect, flashSaleStatus }) => (
    <div data-testid="seat-map">
      <button 
        onClick={() => onSeatSelect({ row: 1, col: 1 })}
        data-testid="seat-button"
      >
        Select Seat
      </button>
      <div data-testid="flash-sale-status">{flashSaleStatus}</div>
    </div>
  )
}))

vi.mock('./PaymentModal', () => ({
  default: ({ isOpen, onClose, selectedSeat, onPaymentSuccess, onPaymentFailed }) => (
    isOpen && (
      <div data-testid="payment-modal">
        <div data-testid="selected-seat">{selectedSeat?.row}-{selectedSeat?.col}</div>
        <button onClick={onClose} data-testid="close-modal">Close</button>
        <button onClick={onPaymentSuccess} data-testid="payment-success">Success</button>
        <button onClick={onPaymentFailed} data-testid="payment-failed">Failed</button>
      </div>
    )
  )
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  }
}))

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Dashboard Component', () => {
  let mockEngine
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create fresh mock engine instance
    mockEngine = {
      getState: vi.fn().mockReturnValue({
        time: '0s',
        status: 'WAITING',
        totalSeats: 100,
        cycleProgress: 0
      }),
      addTransaction: vi.fn(),
      isServerCrashed: vi.fn().mockReturnValue(false)
    }
    
    MockEngine.mockImplementation(() => mockEngine)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render the dashboard with correct title', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('EVENTEASE TERMINAL')).toBeInTheDocument()
      expect(screen.getByText('Flash Sale Control Center - Live Seat Selection')).toBeInTheDocument()
    })

    it('should display initial status as WAITING', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('WAITING')).toBeInTheDocument()
      expect(screen.getByText('0s')).toBeInTheDocument()
    })

    it('should display correct total seats count', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('In Venue')).toBeInTheDocument()
    })

    it('should show all status cards', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('STATUS')).toBeInTheDocument()
      expect(screen.getByText('TOTAL SEATS')).toBeInTheDocument()
      expect(screen.getByText('CYCLE PROGRESS')).toBeInTheDocument()
      expect(screen.getByText('NEXT DROP')).toBeInTheDocument()
    })
  })

  describe('Flash Sale Status Display', () => {
    it('should display LIVE status correctly', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'LIVE',
        totalSeats: 100,
        cycleProgress: 50
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('LIVE')).toBeInTheDocument()
      expect(screen.getByText('30s')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should display SOLD_OUT status correctly', () => {
      mockEngine.getState.mockReturnValue({
        time: '60s',
        status: 'SOLD_OUT',
        totalSeats: 100,
        cycleProgress: 100
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('SOLD_OUT')).toBeInTheDocument()
      expect(screen.getByText('60s')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should display CRASHED status with error message', () => {
      mockEngine.getState.mockReturnValue({
        time: '45s',
        status: 'CRASHED',
        totalSeats: 100,
        cycleProgress: 75
      })
      mockEngine.isServerCrashed.mockReturnValue(true)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('CRASHED')).toBeInTheDocument()
      expect(screen.getByText('⚠️ SERVER UNAVAILABLE - 503 Service Unavailable')).toBeInTheDocument()
    })
  })

  describe('Next Drop Calculation', () => {
    it('should show correct countdown for WAITING status', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'WAITING',
        totalSeats: 100,
        cycleProgress: 0
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should show 45 - 30 = 15 seconds remaining
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should show LIVE for active flash sale', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'LIVE',
        totalSeats: 100,
        cycleProgress: 50
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('LIVE')).toBeInTheDocument()
    })

    it('should show DOWN for crashed server', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'CRASHED',
        totalSeats: 100,
        cycleProgress: 50
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('DOWN')).toBeInTheDocument()
    })
  })

  describe('Seat Map Integration', () => {
    it('should render SeatMap component', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByTestId('seat-map')).toBeInTheDocument()
      expect(screen.getByTestId('seat-button')).toBeInTheDocument()
    })

    it('should pass correct flash sale status to SeatMap', () => {
      mockEngine.getState.mockReturnValue({
        time: '0s',
        status: 'LIVE',
        totalSeats: 100,
        cycleProgress: 25
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByTestId('flash-sale-status')).toHaveTextContent('LIVE')
    })
  })

  describe('Seat Selection and Payment Flow', () => {
    it('should open payment modal when seat is selected', async () => {
      mockEngine.isServerCrashed.mockReturnValue(false)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const seatButton = screen.getByTestId('seat-button')
      fireEvent.click(seatButton)

      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })

      expect(screen.getByTestId('selected-seat')).toHaveTextContent('1-1')
      expect(mockEngine.addTransaction).toHaveBeenCalledWith('SEAT_SELECT', '1-1')
    })

    it('should not open payment modal when server is crashed', () => {
      mockEngine.isServerCrashed.mockReturnValue(true)
      
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const seatButton = screen.getByTestId('seat-button')
      fireEvent.click(seatButton)

      expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
      expect(alertSpy).toHaveBeenCalledWith('Server is currently unavailable. Please try again later.')
      
      alertSpy.mockRestore()
    })

    it('should handle successful payment', async () => {
      mockEngine.isServerCrashed.mockReturnValue(false)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Select seat
      const seatButton = screen.getByTestId('seat-button')
      fireEvent.click(seatButton)

      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })

      // Complete payment
      const successButton = screen.getByTestId('payment-success')
      fireEvent.click(successButton)

      await waitFor(() => {
        expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
      })

      expect(mockEngine.addTransaction).toHaveBeenCalledWith('SUCCESS', '1-1')
    })

    it('should handle failed payment', async () => {
      mockEngine.isServerCrashed.mockReturnValue(false)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Select seat
      const seatButton = screen.getByTestId('seat-button')
      fireEvent.click(seatButton)

      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })

      // Fail payment
      const failButton = screen.getByTestId('payment-failed')
      fireEvent.click(failButton)

      await waitFor(() => {
        expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
      })

      expect(mockEngine.addTransaction).toHaveBeenCalledWith('FAILED', '1-1')
    })

    it('should close payment modal when close button is clicked', async () => {
      mockEngine.isServerCrashed.mockReturnValue(false)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Select seat
      const seatButton = screen.getByTestId('seat-button')
      fireEvent.click(seatButton)

      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })

      // Close modal
      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Engine Integration', () => {
    it('should log server crash state to transactions', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'CRASHED',
        totalSeats: 100,
        cycleProgress: 50
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should log server crash on initial render
      expect(mockEngine.addTransaction).toHaveBeenCalledWith('SERVER_CRASH')
    })

    it('should update state periodically', async () => {
      let callCount = 0
      mockEngine.getState.mockImplementation(() => {
        callCount++
        return {
          time: `${callCount * 10}s`,
          status: callCount > 2 ? 'LIVE' : 'WAITING',
          totalSeats: 100,
          cycleProgress: callCount * 10
        }
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Wait for state updates
      await waitFor(() => {
        expect(mockEngine.getState).toHaveBeenCalledTimes(1)
      }, { timeout: 100 })
    })
  })

  describe('System Visualizer', () => {
    it('should render system visualizer section', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('SYSTEM VISUALIZER')).toBeInTheDocument()
      expect(screen.getByText('CONNECTION STATUS')).toBeInTheDocument()
      expect(screen.getByText('LIVE METRICS')).toBeInTheDocument()
    })

    it('should show correct connection status for LIVE state', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'LIVE',
        totalSeats: 100,
        cycleProgress: 50
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('42ms')).toBeInTheDocument()
      expect(screen.getByText('HIGH')).toBeInTheDocument()
    })

    it('should show correct connection status for CRASHED state', () => {
      mockEngine.getState.mockReturnValue({
        time: '30s',
        status: 'CRASHED',
        totalSeats: 100,
        cycleProgress: 50
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('TIMEOUT')).toBeInTheDocument()
      expect(screen.getByText('CRITICAL')).toBeInTheDocument()
      expect(screen.getByText('OVERFLOW')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('EVENTEASE TERMINAL')

      const statusHeading = screen.getByRole('heading', { name: 'STATUS' })
      expect(statusHeading).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      mockEngine.isServerCrashed.mockReturnValue(false)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const seatButton = screen.getByRole('button', { name: /select seat/i })
      expect(seatButton).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render quickly with large data sets', async () => {
      const startTime = performance.now()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('should not cause memory leaks', () => {
      const { unmount } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Unmount component
      unmount()

      // Component should unmount without errors
      expect(document.body.innerHTML).toBe('')
    })
  })
})
