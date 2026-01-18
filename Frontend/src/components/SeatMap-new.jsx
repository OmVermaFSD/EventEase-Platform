import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/apiClient';

/**
 * Seat Map Component - 10x10 Grid with Real-time Polling
 * 
 * Features:
 * - Polls backend every 1 second for seat updates
 * - Color-coded seat status (Green=Available, Red=Sold)
 * - Handles rate limiting and seat conflicts
 * - Event-driven UI updates
 */

const SeatMap = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Initialize seats grid
  useEffect(() => {
    const initialSeats = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      row: Math.floor(i / 10) + 1,
      col: (i % 10) + 1,
      status: 'AVAILABLE', // AVAILABLE, SOLD, LOCKED
      lastUpdated: Date.now()
    }));
    setSeats(initialSeats);
  }, []);

  // Poll for seat updates every 1 second
  useEffect(() => {
    const pollSeats = async () => {
      try {
        const response = await api.get('/seats');
        const updatedSeats = response.data.map(seat => ({
          ...seat,
          status: seat.status || 'AVAILABLE'
        }));
        setSeats(updatedSeats);
        setLastUpdate(Date.now());
      } catch (error) {
        // Error handled by apiClient interceptor
        console.error('Failed to poll seats:', error);
      }
    };

    // Initial poll
    pollSeats();

    // Set up polling interval
    const interval = setInterval(pollSeats, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for rate limit events
  useEffect(() => {
    const handleRateLimitHit = () => {
      setIsRateLimited(true);
    };

    const handleRateLimitLifted = () => {
      setIsRateLimited(false);
    };

    const handleSeatConflict = () => {
      // Refresh seats when conflict occurs
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    window.addEventListener('RATE_LIMIT_HIT', handleRateLimitHit);
    window.addEventListener('RATE_LIMIT_LIFTED', handleRateLimitLifted);
    window.addEventListener('SEAT_CONFLICT', handleSeatConflict);

    return () => {
      window.removeEventListener('RATE_LIMIT_HIT', handleRateLimitHit);
      window.removeEventListener('RATE_LIMIT_LIFTED', handleRateLimitLifted);
      window.removeEventListener('SEAT_CONFLICT', handleSeatConflict);
    };
  }, []);

  // Handle seat selection
  const handleSeatClick = useCallback(async (seat) => {
    if (isRateLimited) {
      return; // Block interactions during rate limit
    }

    if (seat.status !== 'AVAILABLE') {
      return; // Only allow selection of available seats
    }

    try {
      // Attempt to lock the seat
      const response = await api.post(`/seats/${seat.id}/lock`);
      
      if (response.data.success) {
        setSelectedSeat(seat);
        
        // Update local seat status
        setSeats(prev => prev.map(s => 
          s.id === seat.id 
            ? { ...s, status: 'LOCKED', lastUpdated: Date.now() }
            : s
        ));
      }
    } catch (error) {
      // Error handled by apiClient interceptor
      console.error('Failed to lock seat:', error);
    }
  }, [isRateLimited]);

  // Get seat color based on status
  const getSeatColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500/20 border-green-500 hover:bg-green-500/30 cursor-pointer neon-glow-green';
      case 'SOLD':
        return 'bg-red-500/20 border-red-500 cursor-not-allowed';
      case 'LOCKED':
        return 'bg-yellow-500/20 border-yellow-500 animate-pulse cursor-not-allowed';
      default:
        return 'bg-gray-500/20 border-gray-500 cursor-not-allowed';
    }
  };

  // Get seat icon based on status
  const getSeatIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '○';
      case 'SOLD':
        return '●';
      case 'LOCKED':
        return '◐';
      default:
        return '○';
    }
  };

  // Calculate statistics
  const stats = {
    total: seats.length,
    available: seats.filter(s => s.status === 'AVAILABLE').length,
    sold: seats.filter(s => s.status === 'SOLD').length,
    locked: seats.filter(s => s.status === 'LOCKED').length
  };

  return (
    <div className="p-6 bg-black/50 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-400">SEAT MAP</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded"></div>
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500 rounded"></div>
            <span className="text-gray-400">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded"></div>
            <span className="text-gray-400">Sold</span>
          </div>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {isRateLimited && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm animate-pulse">
          ⛔ System Rate Limited - Please wait...
        </div>
      )}

      {/* Stage */}
      <div className="text-center mb-4">
        <div className="inline-block px-6 py-2 bg-green-500/10 border border-green-500 rounded text-green-400 text-sm font-mono">
          STAGE
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-black/30 p-6 rounded-lg border border-gray-700">
        <div className="grid grid-cols-10 gap-1 max-w-2xl mx-auto">
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              disabled={seat.status !== 'AVAILABLE' || isRateLimited}
              className={`
                aspect-square rounded border-2 flex items-center justify-center text-xs font-mono
                transition-all duration-200 transform hover:scale-110
                ${getSeatColor(seat.status)}
                ${seat.id === selectedSeat?.id ? 'ring-2 ring-blue-500' : ''}
                ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`Seat ${seat.row}-${seat.col}: ${seat.status}`}
            >
              {getSeatIcon(seat.status)}
            </button>
          ))}
        </div>

        {/* Row Labels */}
        <div className="grid grid-cols-10 gap-1 mt-2 max-w-2xl mx-auto">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="text-center text-xs text-gray-500 font-mono">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Seats</div>
        </div>
        <div className="text-center p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{stats.available}</div>
          <div className="text-xs text-gray-400">Available</div>
        </div>
        <div className="text-center p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.locked}</div>
          <div className="text-xs text-gray-400">Locked</div>
        </div>
        <div className="text-center p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{stats.sold}</div>
          <div className="text-xs text-gray-400">Sold</div>
        </div>
      </div>

      {/* Selected Seat Info */}
      {selectedSeat && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400">Selected Seat:</p>
              <p className="text-lg font-bold text-blue-400">
                Row {selectedSeat.row}, Seat {selectedSeat.col}
              </p>
            </div>
            <button
              onClick={() => setSelectedSeat(null)}
              className="px-3 py-1 bg-blue-500 text-black rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SeatMap;
