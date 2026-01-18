import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const TransactionLog = ({ transactions }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transactions]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-3 h-3 text-accent" />;
      case 'CONFLICT':
        return <XCircle className="w-3 h-3 text-yellow-500" />;
      case 'TIMEOUT':
        return <AlertCircle className="w-3 h-3 text-danger" />;
      default:
        return <Terminal className="w-3 h-3 text-accent/50" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-accent';
      case 'CONFLICT':
        return 'text-yellow-500';
      case 'TIMEOUT':
        return 'text-danger';
      default:
        return 'text-accent/70';
    }
  };

  return (
    <div className="glass-effect rounded-lg p-4 h-96 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">TRANSACTION LOG</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="terminal-text text-xs text-accent/70">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 bg-black/50 rounded border border-accent/20 p-3 overflow-hidden">
        <div className="h-full overflow-y-auto terminal-text space-y-1">
          <AnimatePresence initial={false}>
            {transactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-accent/50 terminal-text"
              >
                [INFO] System initialized. Waiting for transactions...
              </motion.div>
            ) : (
              transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 py-1 border-b border-accent/10"
                >
                  <span className="text-accent/50 text-xs w-16 flex-shrink-0">
                    {new Date(transaction.timestamp).toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      fractionalSecondDigits: 3 
                    })}
                  </span>
                  <span className="flex-shrink-0 mt-0.5">
                    {getLogIcon(transaction.type)}
                  </span>
                  <span className={`flex-1 ${getLogColor(transaction.type)}`}>
                    {transaction.message}
                  </span>
                  <span className="text-accent/30 text-xs w-20 text-right">
                    #{transaction.id}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={logEndRef} />
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between terminal-text text-xs text-accent/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-accent" />
            <span>SUCCESS</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-yellow-500" />
            <span>CONFLICT</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-danger" />
            <span>TIMEOUT</span>
          </div>
        </div>
        <div>
          TOTAL: {transactions.length} ENTRIES
        </div>
      </div>
    </div>
  );
};

export default TransactionLog;
