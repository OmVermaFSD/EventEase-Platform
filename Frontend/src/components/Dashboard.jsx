import React, { useState, useEffect } from 'react';
import MockEngine from '../services/mockEngine';
import SeatMap from './SeatMap';
import PaymentModal from './PaymentModal';

const Dashboard = () => {
  const [state, setState] = useState({ time: '0s', status: 'WAITING', totalSeats: 100, cycleProgress: 0 });
  const [engine] = useState(new MockEngine());
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = engine.getState();
      setState(currentState);
      
      // Log server crash state to transactions
      if (currentState.status === 'CRASHED') {
        engine.addTransaction('SERVER_CRASH');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [engine]);

  const handleSeatSelect = (seat) => {
    // Check if server is crashed
    if (engine.isServerCrashed()) {
      alert('Server is currently unavailable. Please try again later.');
      return;
    }

    setSelectedSeat(seat);
    setShowPaymentModal(true);
    
    // Log seat selection attempt
    engine.addTransaction('SEAT_SELECT', `${seat.row}-${seat.col}`);
  };

  const handlePaymentSuccess = () => {
    // Log successful payment
    if (selectedSeat) {
      engine.addTransaction('SUCCESS', `${selectedSeat.row}-${selectedSeat.col}`);
    }
    
    setShowPaymentModal(false);
    setSelectedSeat(null);
  };

  const handlePaymentFailed = () => {
    // Log failed payment
    if (selectedSeat) {
      engine.addTransaction('FAILED', `${selectedSeat.row}-${selectedSeat.col}`);
    }
    
    setShowPaymentModal(false);
    setSelectedSeat(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE': return 'text-neon-green';
      case 'CRASHED': return 'text-red-500';
      case 'SOLD_OUT': return 'text-neon-red';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'LIVE': return 'bg-neon-green/20 border-neon-green';
      case 'CRASHED': return 'bg-red-500/20 border-red-500';
      case 'SOLD_OUT': return 'bg-neon-red/20 border-neon-red';
      default: return 'bg-bg-card border-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neon-green mb-2">EVENTEASE TERMINAL</h1>
        <p className="text-gray-400">Flash Sale Control Center - Live Seat Selection</p>
        {state.status === 'CRASHED' && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm animate-pulse">
            ⚠️ SERVER UNAVAILABLE - 503 Service Unavailable
          </div>
        )}
      </div>

      {/* Top Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Status Card */}
        <div className={`p-6 border-2 rounded-lg ${getStatusBg(state.status)}`}>
          <h2 className="text-lg font-semibold mb-4">STATUS</h2>
          <div className={`text-3xl font-bold ${getStatusColor(state.status)}`}>
            {state.status}
          </div>
          <div className="text-sm text-gray-400 mt-2">{state.time}</div>
        </div>

        {/* Total Seats */}
        <div className="p-6 border-2 border-gray-700 rounded-lg bg-bg-card">
          <h2 className="text-lg font-semibold mb-4">TOTAL SEATS</h2>
          <div className="text-3xl font-bold text-neon-green">
            {state.totalSeats}
          </div>
          <div className="text-sm text-gray-400 mt-2">In Venue</div>
        </div>

        {/* Cycle Progress */}
        <div className="p-6 border-2 border-gray-700 rounded-lg bg-bg-card">
          <h2 className="text-lg font-semibold mb-4">CYCLE PROGRESS</h2>
          <div className="text-3xl font-bold text-neon-yellow">
            {Math.floor(state.cycleProgress)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-neon-yellow h-2 rounded-full transition-all duration-1000"
              style={{ width: `${state.cycleProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Next Drop */}
        <div className="p-6 border-2 border-gray-700 rounded-lg bg-bg-card">
          <h2 className="text-lg font-semibold mb-4">NEXT DROP</h2>
          <div className="text-3xl font-bold text-neon-yellow">
            {state.status === 'WAITING' ? Math.max(0, 45 - parseInt(state.time)) : 
             state.status === 'CRASHED' ? 'DOWN' : 'LIVE'}
          </div>
          <div className="text-sm text-gray-400 mt-2">Seconds</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Visualizer - Side Panel */}
        <div className="lg:col-span-1">
          <div className="p-6 border-2 border-gray-700 rounded-lg bg-bg-card">
            <h2 className="text-xl font-semibold mb-4 text-neon-green">SYSTEM VISUALIZER</h2>
            <div className="space-y-4">
              {/* System Nodes */}
              <div className="flex flex-col items-center space-y-3">
                <div className="text-center">
                  <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center ${
                    state.status === 'CRASHED' 
                      ? 'bg-red-500/20 border-red-500' 
                      : 'bg-neon-green/20 border-neon-green'
                  }`}>
                    <div className={`w-6 h-6 rounded-full ${
                      state.status === 'CRASHED' 
                        ? 'bg-red-500 animate-pulse' 
                        : state.status === 'LIVE' 
                          ? 'bg-neon-green animate-pulse' 
                          : 'bg-gray-600'
                    }`}></div>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">USER</div>
                </div>
                
                <div className="w-0.5 h-8 bg-gray-700">
                  <div className={`h-full ${
                    state.status === 'CRASHED' 
                      ? 'bg-red-500' 
                      : state.status === 'LIVE' 
                        ? 'bg-neon-green animate-pulse' 
                        : ''
                  }`}></div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center ${
                    state.status === 'CRASHED' 
                      ? 'bg-red-500/20 border-red-500' 
                      : 'bg-neon-green/20 border-neon-green'
                  }`}>
                    <div className={`w-6 h-6 rounded-full ${
                      state.status === 'CRASHED' 
                        ? 'bg-red-500' 
                        : state.status === 'LIVE' 
                          ? 'bg-neon-green animate-pulse' 
                          : 'bg-gray-600'
                    }`}></div>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">API</div>
                </div>
                
                <div className="w-0.5 h-8 bg-gray-700">
                  <div className={`h-full ${
                    state.status === 'CRASHED' 
                      ? 'bg-red-500' 
                      : state.status === 'LIVE' 
                        ? 'bg-neon-green animate-pulse' 
                        : ''
                  }`}></div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center ${
                    state.status === 'CRASHED' 
                      ? 'bg-red-500/20 border-red-500' 
                      : 'bg-neon-green/20 border-neon-green'
                  }`}>
                    <div className={`w-6 h-6 rounded-full ${
                      state.status === 'CRASHED' 
                        ? 'bg-red-500' 
                        : state.status === 'LIVE' 
                          ? 'bg-neon-green animate-pulse' 
                          : 'bg-gray-600'
                    }`}></div>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">DATABASE</div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="mt-6 p-4 bg-black/50 rounded border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">CONNECTION STATUS</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Latency:</span>
                    <span className={state.status === 'LIVE' ? 'text-neon-green' : 
                                   state.status === 'CRASHED' ? 'text-red-500' : 'text-gray-500'}>
                      {state.status === 'CRASHED' ? 'TIMEOUT' : 
                       state.status === 'LIVE' ? '42ms' : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Load:</span>
                    <span className={state.status === 'LIVE' ? 'text-neon-yellow' : 
                                   state.status === 'CRASHED' ? 'text-red-500' : 'text-gray-500'}>
                      {state.status === 'CRASHED' ? 'CRITICAL' : 
                       state.status === 'LIVE' ? 'HIGH' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Queue:</span>
                    <span className={state.status === 'LIVE' ? 'text-neon-red' : 
                                   state.status === 'CRASHED' ? 'text-red-500' : 'text-gray-500'}>
                      {state.status === 'CRASHED' ? 'OVERFLOW' : 
                       state.status === 'LIVE' ? Math.floor(Math.random() * 100) + ' req' : '0 req'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Contention:</span>
                    <span className={state.status === 'LIVE' ? 'text-neon-red animate-pulse' : 
                                   state.status === 'CRASHED' ? 'text-red-500' : 'text-gray-500'}>
                      {state.status === 'CRASHED' ? 'CRITICAL' : 
                       state.status === 'LIVE' ? 'HIGH' : 'LOW'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Metrics */}
              <div className="p-4 bg-black/50 rounded border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">LIVE METRICS</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Requests/sec:</span>
                    <span className={state.status === 'CRASHED' ? 'text-red-500' : 'text-neon-green'}>
                      {state.status === 'CRASHED' ? '0' : 
                       state.status === 'LIVE' ? Math.floor(Math.random() * 1000) + 500 : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Success Rate:</span>
                    <span className={state.status === 'CRASHED' ? 'text-red-500' : 'text-neon-green'}>
                      {state.status === 'CRASHED' ? '0%' : 
                       state.status === 'LIVE' ? (85 + Math.random() * 10).toFixed(1) + '%' : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Lock Failures:</span>
                    <span className={state.status === 'CRASHED' ? 'text-red-500' : 'text-neon-red'}>
                      {state.status === 'CRASHED' ? 'ALL' : 
                       state.status === 'LIVE' ? Math.floor(Math.random() * 50) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Map - Center Stage */}
        <div className="lg:col-span-2">
          <SeatMap 
            onSeatSelect={handleSeatSelect} 
            flashSaleStatus={state.status}
            engine={engine}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedSeat={selectedSeat}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailed={handlePaymentFailed}
      />
    </div>
  );
};

export default Dashboard;
