import React, { useState, useEffect, useCallback } from 'react';

const SeatMap = ({ onSeatSelect, flashSaleStatus, engine }) => {
  const [seats, setSeats] = useState(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      status: 'available', // available, sold, locked, selected
      row: Math.floor(i / 10) + 1,
      col: (i % 10) + 1
    }))
  );
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectionTime, setSelectionTime] = useState(null);
  const [contentionError, setContentionError] = useState(null);

  // Contention engine - simulate other users booking seats
  useEffect(() => {
    if (flashSaleStatus !== 'LIVE') return;

    const contentionInterval = setInterval(() => {
      setSeats(prevSeats => {
        const newSeats = [...prevSeats];
        const availableSeats = newSeats.filter(seat => seat.status === 'available');
        
        if (availableSeats.length > 0) {
          // Randomly book 1-3 seats
          const numToBook = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < Math.min(numToBook, availableSeats.length); i++) {
            const randomIndex = Math.floor(Math.random() * availableSeats.length);
            const seatToBook = availableSeats[randomIndex];
            const seatIndex = newSeats.findIndex(s => s.id === seatToBook.id);
            
            if (seatIndex !== -1) {
              // First lock the seat, then sell it after a short delay
              newSeats[seatIndex] = { ...newSeats[seatIndex], status: 'locked' };
              
              // Log seat locking
              if (engine) {
                engine.addTransaction('LOCKED', `${seatToBook.row}-${seatToBook.col}`);
              }
              
              setTimeout(() => {
                setSeats(prev => {
                  const updated = [...prev];
                  const idx = updated.findIndex(s => s.id === seatToBook.id);
                  if (idx !== -1 && updated[idx].status === 'locked') {
                    updated[idx] = { ...updated[idx], status: 'sold' };
                    
                    // Log successful booking by bot
                    if (engine) {
                      engine.addTransaction('SUCCESS', `${seatToBook.row}-${seatToBook.col}`);
                    }
                  }
                  return updated;
                });
              }, 500 + Math.random() * 1000);
            }
            
            // Remove from available seats to avoid duplicate selection
            availableSeats.splice(randomIndex, 1);
          }
        }
        
        return newSeats;
      });
    }, 200);

    return () => clearInterval(contentionInterval);
  }, [flashSaleStatus, engine]);

  // Check for contention on selected seat
  useEffect(() => {
    if (!selectedSeat || !selectionTime) return;

    const contentionCheck = setInterval(() => {
      const timeElapsed = Date.now() - selectionTime;
      
      if (timeElapsed > 2000 && Math.random() > 0.7) {
        // Simulate seat lost to another user
        const errorMsg = `⚠️ Seat ${selectedSeat.row}-${selectedSeat.col} was just locked by another user!`;
        setContentionError(errorMsg);
        
        // Log contention failure
        if (engine) {
          engine.addTransaction('LOCKED', `${selectedSeat.row}-${selectedSeat.col}`);
        }
        
        setSeats(prev => prev.map(seat => 
          seat.id === selectedSeat.id 
            ? { ...seat, status: 'locked' }
            : seat
        ));
        
        setSelectedSeat(null);
        setSelectionTime(null);
        
        setTimeout(() => setContentionError(null), 3000);
      }
    }, 1000);

    return () => clearInterval(contentionCheck);
  }, [selectedSeat, selectionTime, engine]);

  const handleSeatClick = useCallback((seat) => {
    if (seat.status !== 'available' || flashSaleStatus !== 'LIVE') return;

    // Clear previous selection
    setSeats(prev => prev.map(s => 
      s.id === selectedSeat?.id 
        ? { ...s, status: 'available' }
        : s
    ));

    // Select new seat
    setSeats(prev => prev.map(s => 
      s.id === seat.id 
        ? { ...s, status: 'selected' }
        : s
    ));

    setSelectedSeat(seat);
    setSelectionTime(Date.now());
    setContentionError(null);
    
    if (onSeatSelect) {
      onSeatSelect(seat);
    }
  }, [selectedSeat, onSeatSelect, flashSaleStatus]);

  const getSeatColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-neon-green/20 border-neon-green hover:bg-neon-green/30 cursor-pointer neon-glow';
      case 'sold':
        return 'bg-gray-800 border-gray-700 cursor-not-allowed';
      case 'locked':
        return 'bg-neon-yellow/20 border-neon-yellow animate-pulse cursor-not-allowed';
      case 'selected':
        return 'bg-blue-500/30 border-blue-500 hover:bg-blue-500/40 cursor-pointer neon-glow';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  const getSeatIcon = (status) => {
    switch (status) {
      case 'available':
        return '○';
      case 'sold':
        return '●';
      case 'locked':
        return '◐';
      case 'selected':
        return '◆';
      default:
        return '○';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neon-green">LIVE SEAT MAP</h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-neon-green/20 border border-neon-green rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-neon-yellow/20 border border-neon-yellow rounded animate-pulse"></div>
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-800 border border-gray-700 rounded"></div>
            <span>Sold</span>
          </div>
        </div>
      </div>

      {/* Contention Error */}
      {contentionError && (
        <div className="p-3 bg-neon-red/20 border border-neon-red rounded text-neon-red text-sm animate-pulse">
          {contentionError}
        </div>
      )}

      {/* Stage */}
      <div className="text-center mb-4">
        <div className="inline-block px-6 py-2 bg-neon-green/10 border border-neon-green rounded text-neon-green text-sm">
          STAGE
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-black/50 p-6 rounded-lg border border-gray-700">
        <div className="grid grid-cols-10 gap-1 max-w-2xl mx-auto">
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              disabled={seat.status !== 'available' && seat.status !== 'selected'}
              className={`
                aspect-square rounded border-2 flex items-center justify-center text-xs font-mono
                transition-all duration-200 transform hover:scale-110
                ${getSeatColor(seat.status)}
              `}
              title={`Seat ${seat.row}-${seat.col}`}
            >
              {getSeatIcon(seat.status)}
            </button>
          ))}
        </div>

        {/* Row Labels */}
        <div className="grid grid-cols-10 gap-1 max-w-2xl mx-auto mt-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="text-center text-xs text-gray-500">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Info */}
      {selectedSeat && (
        <div className="p-4 bg-blue-500/10 border border-blue-500 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400">Selected Seat:</p>
              <p className="text-lg font-bold text-blue-400">
                Row {selectedSeat.row}, Seat {selectedSeat.col}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {selectionTime && (
                <p>Selected: {Math.floor((Date.now() - selectionTime) / 1000)}s ago</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-neon-green">
            {seats.filter(s => s.status === 'available').length}
          </div>
          <div className="text-xs text-gray-400">Available</div>
        </div>
        <div className="p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-neon-yellow">
            {seats.filter(s => s.status === 'locked').length}
          </div>
          <div className="text-xs text-gray-400">Locked</div>
        </div>
        <div className="p-3 bg-black/50 rounded border border-gray-700">
          <div className="text-2xl font-bold text-gray-400">
            {seats.filter(s => s.status === 'sold').length}
          </div>
          <div className="text-xs text-gray-400">Sold</div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
