import React, { useState, useEffect } from 'react';
import MockEngine from '../services/mockEngine';

const AdminDashboard = ({ onBackToUser }) => {
  const [engine] = useState(new MockEngine());
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [lastAction, setLastAction] = useState('');

  useEffect(() => {
    const updateData = () => {
      setTransactions(engine.getTransactions().slice(0, 50)); // Show last 50
      setAnalytics(engine.getAnalytics());
      setSystemStatus(engine.getSystemStatus());
    };

    updateData();
    const interval = setInterval(updateData, 1000);

    return () => clearInterval(interval);
  }, [engine]);

  const handleReset = () => {
    engine.resetSystem();
    setLastAction('System reset successfully');
    setTimeout(() => setLastAction(''), 3000);
  };

  const handleTriggerFlashSale = () => {
    engine.triggerFlashSale();
    setLastAction('Flash sale triggered manually');
    setTimeout(() => setLastAction(''), 3000);
  };

  const handleCrashServer = () => {
    if (window.confirm('Are you sure you want to crash the server? This will simulate a 503 error for all users.')) {
      engine.crashServer();
      setLastAction('Server crashed - Chaos engineering mode activated');
      setTimeout(() => setLastAction(''), 3000);
    }
  };

  const handleRecoverServer = () => {
    engine.recoverServer();
    setLastAction('Server recovered successfully');
    setTimeout(() => setLastAction(''), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE': return 'text-admin-blue';
      case 'CRASHED': return 'text-red-500';
      case 'WAITING': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'SUCCESS': return 'text-green-400';
      case 'LOCKED': return 'text-yellow-500';
      case 'FAILED': return 'text-red-500';
      case 'ADMIN_RESET': return 'text-admin-blue';
      case 'ADMIN_TRIGGER': return 'text-admin-blue';
      case 'SERVER_CRASH': return 'text-red-500';
      case 'SERVER_RECOVERY': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatRevenue = (revenue) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(revenue);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a1a' }}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#00f0ff' }}>ADMIN COMMAND CENTER</h1>
          <p className="text-gray-400">Event Management System - Manager Mode</p>
        </div>
        <div className="flex items-center gap-4">
          {lastAction && (
            <div className="px-4 py-2 bg-admin-blue/20 border border-admin-blue rounded text-admin-blue text-sm animate-pulse">
              {lastAction}
            </div>
          )}
          <button
            onClick={onBackToUser}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ← Back to User View
          </button>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-admin-blue">SYSTEM STATUS</h2>
          <div className={`text-3xl font-bold ${getStatusColor(systemStatus.status)}`}>
            {systemStatus.status}
          </div>
          {systemStatus.serverCrashed && (
            <div className="text-sm text-red-500 mt-2 animate-pulse">503 Service Unavailable</div>
          )}
        </div>

        <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-admin-blue">TOTAL BOOKINGS</h2>
          <div className="text-3xl font-bold text-admin-blue">
            {analytics.successfulBookings || 0}
          </div>
          <div className="text-sm text-gray-400 mt-2">Successful</div>
        </div>

        <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-admin-blue">REVENUE</h2>
          <div className="text-3xl font-bold text-green-400">
            {formatRevenue(analytics.totalRevenue || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-2">Total Generated</div>
        </div>

        <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-admin-blue">CONVERSION RATE</h2>
          <div className="text-3xl font-bold text-admin-blue">
            {analytics.conversionRate || 0}%
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {analytics.totalTransactions || 0} transactions
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* God Mode Controls */}
        <div className="lg:col-span-1">
          <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50">
            <h2 className="text-xl font-semibold mb-4 text-admin-blue">GOD MODE CONTROLS</h2>
            <div className="space-y-4">
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 bg-admin-blue text-black font-bold rounded hover:bg-admin-blue/80 transition-colors"
              >
                🔄 Reset Event
              </button>
              
              <button
                onClick={handleTriggerFlashSale}
                className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors"
              >
                ⚡ Trigger Flash Sale
              </button>
              
              {!systemStatus.serverCrashed ? (
                <button
                  onClick={handleCrashServer}
                  className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
                >
                  💥 Crash Server
                </button>
              ) : (
                <button
                  onClick={handleRecoverServer}
                  className="w-full py-3 px-4 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-700 transition-colors"
                >
                  🚑 Recover Server
                </button>
              )}

              <button
                onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}
                className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition-colors"
              >
                📚 Open API Docs (Swagger)
              </button>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-admin-blue mb-2">SYSTEM INFO</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span>{Math.floor((systemStatus.uptime || 0) / 1000)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Latency:</span>
                    <span>{analytics.avgLatency || 0}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Failed Bookings:</span>
                    <span className="text-red-400">{analytics.failedBookings || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yield Management */}
          <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-admin-blue">YIELD MANAGEMENT</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Revenue Progress</span>
                  <span className="text-admin-blue">
                    {formatRevenue(analytics.totalRevenue || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-admin-blue to-green-400 h-4 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, ((analytics.totalRevenue || 0) / 9999) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Target: $9,999 (100 seats × $99.99)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-admin-blue/10 rounded">
                  <div className="text-lg font-bold text-admin-blue">
                    {analytics.successfulBookings || 0}
                  </div>
                  <div className="text-xs text-gray-400">Seats Sold</div>
                </div>
                <div className="p-3 bg-red-500/10 rounded">
                  <div className="text-lg font-bold text-red-400">
                    {100 - (analytics.successfulBookings || 0)}
                  </div>
                  <div className="text-xs text-gray-400">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Booking Ledger */}
        <div className="lg:col-span-2">
          <div className="p-6 border-2 border-admin-blue/30 rounded-lg bg-black/50">
            <h2 className="text-xl font-semibold mb-4 text-admin-blue">LIVE BOOKING LEDGER</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-2 text-admin-blue">Transaction ID</th>
                    <th className="text-left py-2 px-2 text-admin-blue">User Hash</th>
                    <th className="text-left py-2 px-2 text-admin-blue">Timestamp</th>
                    <th className="text-left py-2 px-2 text-admin-blue">Status</th>
                    <th className="text-left py-2 px-2 text-admin-blue">Latency</th>
                    <th className="text-left py-2 px-2 text-admin-blue">Seat</th>
                    <th className="text-left py-2 px-2 text-admin-blue">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No transactions yet. Start the flash sale to see activity.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="py-2 px-2 font-mono text-xs text-admin-blue">
                          {txn.id}
                        </td>
                        <td className="py-2 px-2 font-mono text-xs text-gray-400">
                          {txn.userHash}
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-400">
                          {formatTimestamp(txn.timestamp)}
                        </td>
                        <td className={`py-2 px-2 text-xs font-semibold ${getTransactionTypeColor(txn.type)}`}>
                          {txn.type}
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-400">
                          {txn.latency}ms
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-400">
                          {txn.seatId || '-'}
                        </td>
                        <td className="py-2 px-2 text-xs text-green-400">
                          {txn.revenue > 0 ? formatRevenue(txn.revenue) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {transactions.length > 0 && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Showing last 50 transactions • Total: {analytics.totalTransactions || 0}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
