import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('USER');

  const handleAdminLogin = () => {
    setCurrentView('ADMIN');
  };

  const handleBackToUser = () => {
    setCurrentView('USER');
  };

  return (
    <div className="relative">
      {/* Secret Admin Toggle - Hidden in plain sight */}
      {currentView === 'USER' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleAdminLogin}
            className="px-3 py-1 text-xs bg-black/50 border border-gray-700 rounded text-gray-500 hover:border-admin-blue hover:text-admin-blue transition-all"
            title="Admin Access (Click to enter)"
          >
            ◉ ADMIN
          </button>
        </div>
      )}

      {/* Render Current View */}
      {currentView === 'USER' ? (
        <Dashboard />
      ) : (
        <AdminDashboard onBackToUser={handleBackToUser} />
      )}
    </div>
  );
}

export default App;
