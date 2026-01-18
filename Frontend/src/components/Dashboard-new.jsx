import React, { useState, useEffect } from 'react';
import SeatMap from './SeatMap';
import { api } from '../services/apiClient';

/**
 * Financial Terminal Dashboard - Main User Interface
 * 
 * Features:
 * - Trading terminal aesthetic with dark theme
 * - Real-time system status monitoring
 * - Live latency graph visualization
 * - Event-driven updates from API client
 */

const Dashboard = () => {
  const [systemStatus, setSystemStatus] = useState({
    status: 'WAITING',
    time: '0s',
    cycleProgress: 0,
    totalSeats: 100
  });
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Poll system status every 2 seconds
  useEffect(() => {
    const pollSystemStatus = async () => {
      try {
        const response = await api.get('/system/status');
        setSystemStatus(response.data);
        setLastUpdate(Date.now());
        
        // Update latency history
        if (response.data.latency) {
          setLatencyHistory(prev => {
            const newHistory = [...prev, response.data.latency];
            return newHistory.slice(-20); // Keep last 20 data points
          });
        }
      } catch (error) {
        console.error('Failed to poll system status:', error);
      }
    };

    // Initial poll
    pollSystemStatus();

    // Set up polling interval
    const interval = setInterval(pollSystemStatus, 2000);

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

    window.addEventListener('RATE_LIMIT_HIT', handleRateLimitHit);
    window.addEventListener('RATE_LIMIT_LIFTED', handleRateLimitLifted);

    return () => {
      window.removeEventListener('RATE_LIMIT_HIT', handleRateLimitHit);
      window.removeEventListener('RATE_LIMIT_LIFTED', handleRateLimitLifted);
    };
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE':
        return 'text-green-400';
      case 'WAITING':
        return 'text-yellow-400';
      case 'SOLD_OUT':
        return 'text-red-400';
      case 'CRASHED':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  // Get status background
  const getStatusBg = (status) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-500/20 border-green-500';
      case 'WAITING':
        return 'bg-yellow-500/20 border-yellow-500';
      case 'SOLD_OUT':
        return 'bg-red-500/20 border-red-500';
      case 'CRASHED':
        return 'bg-red-500/20 border-red-500';
      default:
        return 'bg-gray-500/20 border-gray-500';
    }
  };

  // Calculate next drop time
  const getNextDropTime = () => {
    if (systemStatus.status === 'WAITING') {
      const currentTime = parseInt(systemStatus.time);
      return Math.max(0, 45 - currentTime);
    }
    return systemStatus.status === 'LIVE' ? 'LIVE' : 'WAITING';
  };

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2">FINANCIAL TERMINAL</h1>
        <p className="text-gray-400">EventEase Flash Sale Control Center</p>
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>

      {/* Rate Limit Warning */}
      {isRateLimited && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-400 animate-pulse">
          ⛔ SYSTEM RATE LIMITED - All operations paused
        </div>
      )}

      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Status Card */}
        <div className={`p-6 border-2 rounded-lg ${getStatusBg(systemStatus.status)}`}>
          <h2 className="text-lg font-semibold mb-4">STATUS</h2>
          <div className={`text-3xl font-bold ${getStatusColor(systemStatus.status)}`}>
            {systemStatus.status}
          </div>
          <div className="text-sm text-gray-400 mt-2">{systemStatus.time}</div>
        </div>

        {/* Total Seats */}
        <div className="p-6 border-2 border-gray-700 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4">TOTAL SEATS</h2>
          <div className="text-3xl font-bold text-green-400">
            {systemStatus.totalSeats}
          </div>
          <div className="text-sm text-gray-400 mt-2">In Venue</div>
        </div>

        {/* Cycle Progress */}
        <div className="p-6 border-2 border-gray-700 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4">CYCLE PROGRESS</h2>
          <div className="text-3xl font-bold text-yellow-400">
            {Math.floor(systemStatus.cycleProgress)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${systemStatus.cycleProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Next Drop */}
        <div className="p-6 border-2 border-gray-700 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4">NEXT DROP</h2>
          <div className="text-3xl font-bold text-yellow-400">
            {getNextDropTime()}
          </div>
          <div className="text-sm text-gray-400 mt-2">Seconds</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Latency Graph */}
        <div className="lg:col-span-1">
          <div className="p-6 border-2 border-gray-700 rounded-lg bg-black/50">
            <h2 className="text-xl font-semibold mb-4 text-green-400">LIVE LATENCY</h2>
            
            {/* Latency Graph */}
            <div className="h-32 bg-black/30 rounded border border-gray-700 p-2">
              <div className="h-full flex items-end justify-between">
                {latencyHistory.map((latency, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-green-400 transition-all duration-300"
                    style={{ 
                      height: `${Math.min(100, (latency / 100) * 100)}%`,
                      opacity: latency > 0 ? 1 : 0.3
                    }}
                    title={`${latency}ms`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Latency Stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-black/50 rounded border border-gray-700">
                <div className="text-lg font-bold text-green-400">
                  {latencyHistory.length > 0 ? latencyHistory[latencyHistory.length - 1] : 0}ms
                </div>
                <div className="text-xs text-gray-400">Current</div>
              </div>
              <div className="text-center p-2 bg-black/50 rounded border border-gray-700">
                <div className="text-lg font-bold text-yellow-400">
                  {latencyHistory.length > 0 
                    ? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length)
                    : 0}ms
                </div>
                <div className="text-xs text-gray-400">Average</div>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Map - Main Feature */}
        <div className="lg:col-span-2">
          <SeatMap />
        </div>
      </div>

      {/* System Information Footer */}
      <div className="mt-8 p-4 bg-black/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">API Endpoint</div>
            <div className="font-mono text-green-400">localhost:8080</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Rate Limit</div>
            <div className={isRateLimited ? 'text-red-400' : 'text-green-400'}>
              {isRateLimited ? 'ACTIVE' : 'NORMAL'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">System Health</div>
            <div className={getStatusColor(systemStatus.status)}>
              {systemStatus.status}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Active Sessions</div>
            <div className="text-green-400">
              {Math.floor(Math.random() * 1000) + 500}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
