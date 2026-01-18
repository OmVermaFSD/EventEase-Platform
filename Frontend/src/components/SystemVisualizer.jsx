import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Server, Database, Wifi, ArrowRight } from 'lucide-react';

const SystemVisualizer = ({ saleState }) => {
  const [dataPackets, setDataPackets] = useState([]);
  const [dbStatus, setDbStatus] = useState('idle');

  const nodes = [
    { id: 'user', icon: User, label: 'USER', x: 10, y: 50 },
    { id: 'loadbalancer', icon: Wifi, label: 'LOAD BALANCER', x: 30, y: 50 },
    { id: 'apigateway', icon: Server, label: 'API GATEWAY', x: 50, y: 50 },
    { id: 'db', icon: Database, label: 'DB CLUSTER', x: 70, y: 50 },
  ];

  const connections = [
    { from: 'user', to: 'loadbalancer' },
    { from: 'loadbalancer', to: 'apigateway' },
    { from: 'apigateway', to: 'db' },
  ];

  const simulateDataFlow = () => {
    if (saleState !== 'drop') return;
    
    const packetId = Date.now();
    const success = Math.random() > 0.2;
    
    setDataPackets(prev => [...prev, { id: packetId, success }]);
    
    // Animate through nodes
    setTimeout(() => {
      setDbStatus(success ? 'success' : 'error');
      setTimeout(() => setDbStatus('idle'), 500);
    }, 1500);
    
    setTimeout(() => {
      setDataPackets(prev => prev.filter(p => p.id !== packetId));
    }, 2000);
  };

  const getNodeColor = (nodeId) => {
    if (nodeId === 'db' && dbStatus !== 'idle') {
      return dbStatus === 'success' ? 'text-accent' : 'text-danger';
    }
    return saleState === 'drop' ? 'text-accent' : 'text-accent/30';
  };

  return (
    <div className="glass-effect rounded-lg p-6 relative h-96 overflow-hidden">
      <h2 className="text-xl font-bold mb-6">SYSTEM ARCHITECTURE</h2>
      
      <svg className="absolute inset-0 w-full h-full">
        {/* Connections */}
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          
          return (
            <motion.line
              key={idx}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5,5"
              className="text-accent/20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          );
        })}
        
        {/* Data Packets */}
        <AnimatePresence>
          {dataPackets.map((packet) => (
            <motion.circle
              key={packet.id}
              r="4"
              fill={packet.success ? "#00ff41" : "#ff3b30"}
              initial={{ cx: "10%", cy: "50%" }}
              animate={[
                { cx: "30%", cy: "50%" },
                { cx: "50%", cy: "50%" },
                { cx: "70%", cy: "50%" }
              ]}
              transition={{ duration: 1.5, ease: "linear" }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </svg>
      
      {/* Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className={`p-3 rounded-full glass-effect ${getNodeColor(node.id)} ${
                node.id === 'db' && dbStatus !== 'idle' ? 'animate-pulse' : ''
              }`}
              animate={node.id === 'db' && dbStatus !== 'idle' ? {
                boxShadow: dbStatus === 'success' 
                  ? '0 0 20px rgba(0, 255, 65, 0.8)'
                  : '0 0 20px rgba(255, 59, 48, 0.8)'
              } : {}}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
            <span className="terminal-text text-xs mt-2 text-accent/70">{node.label}</span>
          </motion.div>
        );
      })}
      
      {/* Control Button */}
      <div className="absolute bottom-4 left-4">
        <button
          onClick={simulateDataFlow}
          disabled={saleState !== 'drop'}
          className={`px-4 py-2 text-sm font-bold rounded transition-all ${
            saleState === 'drop'
              ? 'bg-accent/20 text-accent hover:bg-accent/30 border border-accent'
              : 'bg-accent/10 text-accent/30 cursor-not-allowed border border-accent/20'
          }`}
        >
          SIMULATE REQUEST
        </button>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="flex items-center gap-2 terminal-text text-xs">
          <div className={`w-2 h-2 rounded-full ${
            saleState === 'drop' ? 'bg-accent animate-pulse' : 'bg-accent/30'
          }`} />
          <span className={saleState === 'drop' ? 'text-accent' : 'text-accent/50'}>
            {saleState.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemVisualizer;
