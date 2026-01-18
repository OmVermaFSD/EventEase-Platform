import React, { useState, useEffect } from 'react';
import { bookSeat, isSystemOverloaded } from './api';

const Dashboard = () => {
  const [seats, setSeats] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [systemStatus, setSystemStatus] = useState('WAITING');
  const [gridDisabled, setGridDisabled] = useState(false);

  useEffect(() => {
    const initialSeats = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      status: 'AVAILABLE'
    }));
    setSeats(initialSeats);
  }, []);

  useEffect(() => {
    const pollSeats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/seats');
        const data = await response.json();
        setSeats(data);
      } catch (error) {
        console.error('Failed to poll seats:', error);
      }
    };

    pollSeats();
    const interval = setInterval(pollSeats, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pollSystem = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/system/status');
        const data = await response.json();
        setSystemStatus(data.status);
        
        if (data.latency) {
          setLatencyHistory(prev => [...prev.slice(-19), data.latency]);
        }
      } catch (error) {
        console.error('Failed to poll system:', error);
      }
    };

    pollSystem();
    const interval = setInterval(pollSystem, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSystemOverloaded) {
      setGridDisabled(true);
      setTimeout(() => {
        setGridDisabled(false);
      }, 5000);
    }
  }, [isSystemOverloaded]);

  const handleBookSeat = async (seat) => {
    if (seat.status !== 'AVAILABLE' || gridDisabled) return;

    try {
      await bookSeat(seat.id);
      // Optimistic UI update - turn seat RED immediately
      setSeats(prev => prev.map(s => 
        s.id === seat.id ? { ...s, status: 'SOLD' } : s
      ));
    } catch (error) {
      if (error.message === 'Seat taken!') {
        alert('Seat Taken');
      }
      // Refresh seats on any error
      const response = await fetch('http://localhost:8080/api/seats');
      const data = await response.json();
      setSeats(data);
    }
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return '#00ff41';
      case 'SOLD': return '#ff3b30';
      case 'LOCKED': return '#f59e0b';
      default: return '#666';
    }
  };

  const renderLatencyGraph = () => {
    const maxLatency = Math.max(...latencyHistory, 100);
    const width = 300;
    const height = 100;
    const barWidth = width / Math.max(latencyHistory.length, 1);

    return (
      <svg width={width} height={height} className="border border-gray-600 bg-black/50">
        {latencyHistory.map((latency, i) => (
          <rect
            key={i}
            x={i * barWidth}
            y={height - (latency / maxLatency) * height}
            width={barWidth - 1}
            height={(latency / maxLatency) * height}
            fill="#00ff41"
            opacity="0.8"
          />
        ))}
      </svg>
    );
  };

  const renderAdminTable = () => (
    <div className="bg-black/50 border border-gray-600 rounded p-4">
      <h3 className="text-green-400 font-bold mb-4">TRANSACTION LOG</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-green-400">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">TYPE</th>
              <th className="text-left p-2">STATUS</th>
              <th className="text-left p-2">TIME</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map((tx, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="p-2">{tx.id}</td>
                <td className="p-2">{tx.type}</td>
                <td className="p-2">{tx.status}</td>
                <td className="p-2">{new Date(tx.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-green-400 p-6 font-mono">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-400 mb-2">EVENTEASE TERMINAL</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">STATUS: {systemStatus}</span>
          {isSystemOverloaded && (
            <span className="text-red-400 text-sm animate-pulse">SYSTEM OVERLOADED</span>
          )}
          {gridDisabled && (
            <span className="text-yellow-400 text-sm animate-pulse">GRID DISABLED</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          className="px-4 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors"
        >
          {isAdminMode ? 'USER MODE' : 'ADMIN MODE'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-black/50 border border-gray-600 rounded p-4">
            <h2 className="text-green-400 font-bold mb-4">SEAT MAP</h2>
            <div className={`grid grid-cols-10 gap-1 mb-4 ${gridDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleBookSeat(seat)}
                  disabled={seat.status !== 'AVAILABLE' || gridDisabled}
                  className="aspect-square rounded border border-gray-600 flex items-center justify-center text-xs hover:border-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: getSeatColor(seat.status) }}
                >
                  {seat.id}
                </button>
              ))}
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#00ff41' }}></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ff3b30' }}></div>
                <span>Sold</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/50 border border-gray-600 rounded p-4">
            <h2 className="text-green-400 font-bold mb-4">LATENCY (ms)</h2>
            {renderLatencyGraph()}
            <div className="text-xs mt-2">
              Current: {latencyHistory[latencyHistory.length - 1] || 0}ms
            </div>
          </div>

          {isAdminMode && renderAdminTable()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
