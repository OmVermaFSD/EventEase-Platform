class MockEngine {
  constructor() {
    this.startTime = Date.now();
    this.totalSeats = 100;
    this.bookingIdCounter = 1000;
    this.transactionIdCounter = 2000;
    this.transactionHistory = [];
    this.currentStatus = 'WAITING';
    this.serverCrashed = false;
    this.forceLive = false;
    this.revenuePerSeat = 99.99;
  }

  getState() {
    if (this.serverCrashed) {
      return { 
        time: '0s', 
        status: 'CRASHED', 
        totalSeats: this.totalSeats,
        cycleProgress: 0,
        error: '503 Service Unavailable'
      };
    }

    const now = Date.now();
    const elapsed = (now - this.startTime) % 60000; // 60-second cycle
    const time = `${Math.floor(elapsed / 1000)}s`;
    
    let status = this.currentStatus;
    
    // Override with admin controls
    if (this.forceLive) {
      status = 'LIVE';
    } else if (elapsed >= 45000) {
      status = 'LIVE';
    } else {
      status = 'WAITING';
    }
    
    this.currentStatus = status;
    
    return { 
      time, 
      status, 
      totalSeats: this.totalSeats,
      cycleProgress: this.forceLive ? 100 : (elapsed / 60000) * 100
    };
  }

  generateBookingId() {
    return 'EVT' + this.bookingIdCounter++;
  }

  generateTransactionId() {
    return 'TXN' + this.transactionIdCounter++;
  }

  simulateContention() {
    // Returns number of seats to book in this contention cycle
    return Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
  }

  // Admin Functions
  addTransaction(type, seatId = null, userHash = null, latency = null) {
    const transaction = {
      id: this.generateTransactionId(),
      timestamp: new Date().toISOString(),
      type: type, // SUCCESS, LOCKED, FAILED, ADMIN_RESET
      seatId: seatId,
      userHash: userHash || this.generateUserHash(),
      latency: latency || Math.floor(Math.random() * 200) + 50,
      revenue: type === 'SUCCESS' && seatId ? this.revenuePerSeat : 0
    };
    
    this.transactionHistory.unshift(transaction);
    
    // Keep only last 1000 transactions
    if (this.transactionHistory.length > 1000) {
      this.transactionHistory = this.transactionHistory.slice(0, 1000);
    }
    
    return transaction;
  }

  generateUserHash() {
    return 'USER_' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  getTransactions() {
    return [...this.transactionHistory];
  }

  getAnalytics() {
    const successful = this.transactionHistory.filter(t => t.type === 'SUCCESS').length;
    const failed = this.transactionHistory.filter(t => t.type === 'FAILED' || t.type === 'LOCKED').length;
    const totalRevenue = this.transactionHistory.reduce((sum, t) => sum + t.revenue, 0);
    const avgLatency = this.transactionHistory.length > 0 
      ? this.transactionHistory.reduce((sum, t) => sum + t.latency, 0) / this.transactionHistory.length 
      : 0;

    return {
      successfulBookings: successful,
      failedBookings: failed,
      totalRevenue: totalRevenue,
      avgLatency: Math.round(avgLatency),
      conversionRate: this.transactionHistory.length > 0 
        ? ((successful / this.transactionHistory.length) * 100).toFixed(1)
        : 0,
      totalTransactions: this.transactionHistory.length
    };
  }

  // Admin Controls
  resetSystem() {
    this.startTime = Date.now();
    this.currentStatus = 'WAITING';
    this.forceLive = false;
    this.serverCrashed = false;
    this.addTransaction('ADMIN_RESET');
    return true;
  }

  triggerFlashSale() {
    this.forceLive = true;
    this.currentStatus = 'LIVE';
    this.addTransaction('ADMIN_TRIGGER');
    return true;
  }

  crashServer() {
    this.serverCrashed = true;
    this.currentStatus = 'CRASHED';
    this.addTransaction('SERVER_CRASH');
    return true;
  }

  recoverServer() {
    this.serverCrashed = false;
    this.currentStatus = 'WAITING';
    this.forceLive = false;
    this.addTransaction('SERVER_RECOVERY');
    return true;
  }

  isServerCrashed() {
    return this.serverCrashed;
  }

  getSystemStatus() {
    return {
      status: this.currentStatus,
      serverCrashed: this.serverCrashed,
      forceLive: this.forceLive,
      uptime: Date.now() - this.startTime
    };
  }
}

export default MockEngine;
