import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';

/**
 * Admin Dashboard Component - Backend Integration
 * 
 * Features:
 * - Real-time transaction log
 * - System metrics and analytics
 * - Backend API documentation link
 * - Event-driven updates from API client
 */

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalBookings: 0,
    successfulBookings: 0,
    failedBookings: 0,
    averageLatency: 0,
    systemStatus: 'HEALTHY'
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Poll for transaction updates
  useEffect(() => {
    const pollTransactions = async () => {
      try {
        const response = await api.get('/admin/transactions');
        setTransactions(response.data.slice(0, 50)); // Show last 50 transactions
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to poll transactions:', error);
      }
    };

    const pollMetrics = async () => {
      try {
        const response = await api.get('/admin/metrics');
        setSystemMetrics(response.data);
      } catch (error) {
        console.error('Failed to poll metrics:', error);
      }
    };

    // Initial poll
    pollTransactions();
    pollMetrics();

    // Set up polling intervals
    const transactionInterval = setInterval(pollTransactions, 2000);
    const metricsInterval = setInterval(pollMetrics, 5000);

    return () => {
      clearInterval(transactionInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  // Handle opening Swagger documentation
  const handleOpenSwagger = () => {
    window.open('http://localhost:8080/swagger-ui.html', '_blank');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-blue-400';
      case 'DEGRADED':
        return 'text-yellow-400';
      case 'CRITICAL':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">ADMIN COMMAND CENTER</h1>
        <p className="text-gray-400">Backend Integration & System Monitoring</p>
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {formatTimestamp(lastUpdate)}
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-6 border-2 border-blue-500/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">SYSTEM STATUS</h2>
          <div className={`text-3xl font-bold ${getStatusColor(systemMetrics.systemStatus)}`}>
            {systemMetrics.systemStatus}
          </div>
        </div>

        <div className="p-6 border-2 border-blue-500/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">TOTAL BOOKINGS</h2>
          <div className="text-3xl font-bold text-blue-400">
            {systemMetrics.totalBookings}
          </div>
          <div className="text-sm text-gray-400 mt-2">All Transactions</div>
        </div>

        <div className="p-6 border-2 border-blue-500/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">SUCCESS RATE</h2>
          <div className="text-3xl font-bold text-green-400">
            {systemMetrics.totalBookings > 0 
              ? Math.round((systemMetrics.successfulBookings / systemMetrics.totalBookings) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {systemMetrics.successfulBookings} / {systemMetrics.totalBookings}
          </div>
        </div>

        <div className="p-6 border-2 border-blue-500/30 rounded-lg bg-black/50">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">AVG LATENCY</h2>
          <div className="text-3xl font-bold text-blue-400">
            {systemMetrics.averageLatency}ms
          </div>
          <div className="text-sm text-gray-400 mt-2">Response Time</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Log */}
        <div className="lg:col-span-2">
          <div className="p-6 border-2 border-blue-500/30 rounded-lg bg-black/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-400">REAL-TIME TRANSACTION LOG</h2>
              <div className="text-sm text-gray-400">
                {transactions.length} transactions
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-4 text-blue-400">ID</th>
                    <th className="text-left py-2 px-4 text-blue-400">Type</th>
                    <th className="text-left py-2 px-4 text-blue-400">Status</th>
                    <th className="text-left py-2 px-4 text-blue-400">Latency</th>
                    <th className="text-left py-2 px-4 text-blue-400">User</th>
                    <th className="text-left py-2 px-4 text-blue-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id}
                      className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="py-2 px-4 font-mono text-xs">
                        {transaction.id.substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
                          transaction.type === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                          transaction.type === 'LOCKED' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          transaction.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          transaction.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-mono">
                        {transaction.latency}ms
                      </td>
                      <td className="py-2 px-4 font-mono text-xs">
                        {transaction.userId?.substring(0, 6)}...
                      </td>
                      <td className="py-2 px-4 text-xs text-gray-400">
                        {formatTimestamp(transaction.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No transactions yet. Waiting for activity...
              </div>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        <div className="lg:col-span-1">
          <div className="p-6 border-2 border-blue-500/30 rounded-lg bg-black/50">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">ADMIN CONTROLS</h2>
            <div className="space-y-4">
              {/* Swagger API Documentation */}
              <button
                onClick={handleOpenSwagger}
                className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                📚 Open Backend API (Swagger)
              </button>

              {/* System Controls */}
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">SYSTEM ACTIONS</h3>
                <div className="space-y-2">
                  <button className="w-full py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    🔄 Refresh Data
                  </button>
                  <button className="w-full py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                    ⚡ Trigger Flash Sale
                  </button>
                  <button className="w-full py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                    💥 Simulate Load Test
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">SYSTEM INFO</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Endpoint:</span>
                    <span className="font-mono">localhost:8080</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate Limit:</span>
                    <span className={api.isRateLimited() ? 'text-red-400' : 'text-green-400'}>
                      {api.isRateLimited() ? 'ACTIVE' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span>99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
