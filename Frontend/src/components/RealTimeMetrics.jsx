import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Database, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 1240,
    serverLatency: 42,
    dbLocks: 'HIGH',
    throughput: 850,
    errorRate: 2.3,
    cpuUsage: 78
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 21) - 10,
        serverLatency: Math.max(15, Math.min(200, prev.serverLatency + Math.floor(Math.random() * 11) - 5)),
        dbLocks: Math.random() > 0.7 ? 'CRITICAL' : Math.random() > 0.3 ? 'HIGH' : 'MEDIUM',
        throughput: Math.max(200, Math.min(1500, prev.throughput + Math.floor(Math.random() * 101) - 50)),
        errorRate: Math.max(0, Math.min(10, prev.errorRate + (Math.random() * 2 - 1))),
        cpuUsage: Math.max(20, Math.min(95, prev.cpuUsage + Math.floor(Math.random() * 11) - 5))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ icon: Icon, label, value, unit, trend, status }) => (
    <motion.div
      className="glass-effect rounded-lg p-4"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent/70" />
          <span className="terminal-text text-xs text-accent/70">{label}</span>
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-accent" />
            ) : (
              <TrendingDown className="w-3 h-3 text-danger" />
            )}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold ${
          status === 'critical' ? 'text-danger animate-flicker' : 
          status === 'warning' ? 'text-yellow-500' : 
          'text-accent'
        }`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="terminal-text text-xs text-accent/50">{unit}</span>}
      </div>
    </motion.div>
  );

  const LatencyGraph = () => {
    const points = Array.from({ length: 20 }, (_, i) => {
      const latency = 42 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
      return `${i * 5},${100 - latency}`;
    }).join(' ');

    return (
      <div className="glass-effect rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-accent/70" />
          <span className="terminal-text text-xs text-accent/70">LATENCY GRAPH</span>
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-20">
          <polyline
            points={points}
            fill="none"
            stroke="#00ff41"
            strokeWidth="0.5"
            className="opacity-80"
          />
        </svg>
        <div className="flex justify-between mt-2">
          <span className="terminal-text text-xs text-accent/50">0ms</span>
          <span className="terminal-text text-xs text-accent/50">200ms</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Activity className="w-5 h-5" />
        REAL-TIME METRICS
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Activity}
          label="ACTIVE USERS"
          value={metrics.activeUsers}
          trend="up"
        />
        
        <MetricCard
          icon={Clock}
          label="SERVER LATENCY"
          value={metrics.serverLatency}
          unit="ms"
          status={metrics.serverLatency > 100 ? 'critical' : metrics.serverLatency > 50 ? 'warning' : 'normal'}
        />
        
        <MetricCard
          icon={Database}
          label="DB LOCKS"
          value={metrics.dbLocks}
          status={metrics.dbLocks === 'CRITICAL' ? 'critical' : metrics.dbLocks === 'HIGH' ? 'warning' : 'normal'}
        />
        
        <MetricCard
          icon={TrendingUp}
          label="THROUGHPUT"
          value={metrics.throughput}
          unit="req/s"
        />
      </div>
      
      <LatencyGraph />
      
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={AlertTriangle}
          label="ERROR RATE"
          value={metrics.errorRate}
          unit="%"
          status={metrics.errorRate > 5 ? 'critical' : metrics.errorRate > 2 ? 'warning' : 'normal'}
        />
        
        <MetricCard
          icon={Activity}
          label="CPU USAGE"
          value={metrics.cpuUsage}
          unit="%"
          status={metrics.cpuUsage > 85 ? 'critical' : metrics.cpuUsage > 70 ? 'warning' : 'normal'}
        />
      </div>
    </div>
  );
};

export default RealTimeMetrics;
