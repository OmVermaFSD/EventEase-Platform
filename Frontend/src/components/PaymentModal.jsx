import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, selectedSeat, onPaymentSuccess, onPaymentFailed }) => {
  const [stage, setStage] = useState('form'); // form, processing, success
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [formData, setFormData] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
    name: ''
  });

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (onPaymentFailed) onPaymentFailed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onPaymentFailed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStage('processing');

    // Simulate payment processing
    setTimeout(() => {
      // 90% success rate
      if (Math.random() > 0.1) {
        setStage('success');
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        setStage('form');
        if (onPaymentFailed) {
          onPaymentFailed();
        }
      }
    }, 3000);
  };

  const generateBookingId = () => {
    return 'EVT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const generateQRCode = () => {
    // Simple QR code placeholder - in real app would use QR library
    return `BOOKING:${generateBookingId()}:SEAT:${selectedSeat?.row}-${selectedSeat?.col}:TIME:${Date.now()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card border border-gray-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neon-green">Complete Booking</h2>
            <button
              onClick={() => {
                if (onPaymentFailed) onPaymentFailed();
                onClose();
              }}
              className="text-gray-400 hover:text-neon-green transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Timer */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-neon-red animate-pulse' : 'text-neon-yellow'}`}>
              {formatTime(timeLeft)}
            </div>
            <span className="text-sm text-gray-400">Time left to pay</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {stage === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seat Info */}
              <div className="p-3 bg-neon-green/10 border border-neon-green rounded">
                <p className="text-sm text-neon-green">Selected Seat:</p>
                <p className="text-lg font-bold text-neon-green">
                  Row {selectedSeat?.row}, Seat {selectedSeat?.col}
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white focus:border-neon-green focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white focus:border-neon-green focus:outline-none"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              {/* Card Payment */}
              {formData.paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white focus:border-neon-green focus:outline-none"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.expiry}
                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                        className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white focus:border-neon-green focus:outline-none"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white focus:border-neon-green focus:outline-none"
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Payment */}
              {formData.paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-white focus:border-neon-green focus:outline-none"
                    placeholder="username@upi"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-neon-green text-black font-bold rounded hover:bg-neon-green/90 transition-colors"
              >
                Pay Now
              </button>
            </form>
          )}

          {stage === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-bold text-neon-green mb-2">Processing Payment</h3>
              <p className="text-gray-400">Contacting Bank Gateway...</p>
              <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-8">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-neon-green/20 border-2 border-neon-green rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-neon-green">✓</div>
              </div>

              <h3 className="text-lg font-bold text-neon-green mb-2">Payment Successful!</h3>
              
              {/* Ticket Receipt */}
              <div className="bg-black/50 border border-gray-700 rounded-lg p-4 mt-6 text-left">
                <div className="text-center mb-4">
                  <div className="text-xs text-gray-400 mb-2">BOOKING ID</div>
                  <div className="text-lg font-bold text-neon-green font-mono">
                    {generateBookingId()}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event:</span>
                    <span>EventEase Concert</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seat:</span>
                    <span>Row {selectedSeat?.row}, Seat {selectedSeat?.col}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-2">QR CODE</div>
                    <div className="w-24 h-24 bg-white mx-auto p-1 rounded">
                      <div className="w-full h-full bg-black flex items-center justify-center text-xs text-white font-mono p-1">
                        {generateQRCode().substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onPaymentSuccess) onPaymentSuccess();
                  onClose();
                }}
                className="mt-6 px-6 py-2 bg-neon-green text-black font-bold rounded hover:bg-neon-green/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
