import React, { useState, useEffect } from 'react';
import { fetchSeats, bookSeat } from './api';

export default function Dashboard() {
    const [seats, setSeats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState(null); // The seat being booked
    const [bookingStage, setBookingStage] = useState('idle'); // idle | form | processing | success
    const [customerName, setCustomerName] = useState('');

    const addLog = (type, status) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [{ id: Date.now(), type, status, time }, ...prev].slice(0, 10));
    };

    useEffect(() => {
        addLog("SYSTEM", "Booting Payment Gateway...");
        loadSeats();
    }, []);

    const loadSeats = async () => {
        try {
            const data = await fetchSeats();
            setSeats(data || []);
            setLoading(false);
        } catch (e) {
            addLog("ERROR", "Connection Failed");
            setLoading(false);
        }
    };

    // Step 1: User Clicks a Seat
    const handleSeatClick = (seat) => {
        if (seat.sold) return;
        setSelectedSeat(seat);
        setBookingStage('form');
        addLog("USER", `Selected Seat ${seat.seatNumber}`);
    };

    // Step 2: User Submits Payment
    const handlePayment = async (e) => {
        e.preventDefault();
        setBookingStage('processing');
        addLog("PAYMENT", "Initiating Secure Transaction...");

        // Simulate Real World Delays
        setTimeout(() => addLog("BANK", "Contacting Visa/Mastercard..."), 1000);
        setTimeout(() => addLog("BANK", "Verifying Funds..."), 2000);
        
        setTimeout(async () => {
            try {
                await bookSeat(selectedSeat.id);
                addLog("SUCCESS", "Payment Approved. Transaction ID: TXN-" + Date.now());
                setBookingStage('success');
                loadSeats(); // Refresh grid
            } catch (error) {
                addLog("ERROR", "Payment Declined");
                setBookingStage('idle');
                setSelectedSeat(null);
            }
        }, 3500); // 3.5 second fake delay
    };

    const closeReceipt = () => {
        setSelectedSeat(null);
        setBookingStage('idle');
        setCustomerName('');
    };

    if (loading) return <div className="p-10 bg-black text-green-500 font-mono">INITIALIZING...</div>;

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-8 relative">
            <div className="max-w-6xl mx-auto flex gap-8">
                
                {/* LEFT: SEAT MAP */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-6 border-b border-green-700 pb-2">EVENT_EASE TERMINAL</h1>
                    <div className="grid grid-cols-10 gap-3">
                        {seats.map(seat => (
                            <button
                                key={seat.id}
                                disabled={seat.sold}
                                onClick={() => handleSeatClick(seat)}
                                className={`w-12 h-12 flex items-center justify-center text-xs font-bold rounded transition-all
                                    ${seat.sold 
                                        ? 'bg-red-900 text-red-300 cursor-not-allowed border border-red-700' 
                                        : 'bg-gray-900 text-green-400 hover:bg-green-700 hover:text-black border border-green-800'
                                    }`}
                            >
                                {seat.seatNumber}
                            </button>
                        ))}
                    </div>
                    
                    <div className="mt-6 flex gap-4 text-sm">
                        <div className="flex items-center"><div className="w-3 h-3 bg-gray-900 border border-green-800 mr-2"></div> Available ($150)</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-red-900 border border-red-700 mr-2"></div> Sold Out</div>
                    </div>
                </div>

                {/* RIGHT: LIVE LOGS */}
                <div className="w-96 border border-green-800 bg-black p-4 h-[600px] overflow-hidden flex flex-col">
                    <h2 className="text-xl font-bold mb-4 border-b border-green-800 pb-2">TRANSACTION LOG</h2>
                    <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
                        {logs.map(log => (
                            <div key={log.id} className="border-l-2 border-green-700 pl-2">
                                <span className="opacity-50">[{log.time}]</span> 
                                <span className={`font-bold ml-2 ${log.type === 'ERROR' ? 'text-red-500' : 'text-green-400'}`}>
                                    {log.type}
                                </span>
                                <div className="opacity-80">{log.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL: PAYMENT FORM */}
            {selectedSeat && bookingStage === 'form' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-green-500 p-8 w-96 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                        <h2 className="text-2xl font-bold text-white mb-4">CONFIRM BOOKING</h2>
                        <div className="mb-4 text-green-400">Seat: {selectedSeat.seatNumber} <span className="float-right text-white">$150.00</span></div>
                        
                        <form onSubmit={handlePayment}>
                            <div className="mb-4">
                                <label className="block text-xs mb-1">CUSTOMER NAME</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-black border border-green-700 p-2 text-white focus:outline-none focus:border-green-400"
                                    placeholder="JOHN DOE"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs mb-1">CARD NUMBER (FAKE)</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-black border border-green-700 p-2 text-white focus:outline-none focus:border-green-400"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={closeReceipt} className="flex-1 border border-red-500 text-red-500 py-2 hover:bg-red-900/20">CANCEL</button>
                                <button type="submit" className="flex-1 bg-green-600 text-black font-bold py-2 hover:bg-green-500">PAY $150</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: PROCESSING */}
            {bookingStage === 'processing' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
                    <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
                    <div className="text-xl animate-pulse">PROCESSING SECURE PAYMENT...</div>
                    <div className="text-sm opacity-50 mt-2">DO NOT CLOSE THIS WINDOW</div>
                </div>
            )}

            {/* MODAL: RECEIPT */}
            {bookingStage === 'success' && (
                <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-8 w-96 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <h2 className="text-2xl font-bold mb-4">BOOKING CONFIRMED</h2>
                        <div className="border-t border-b border-black py-4 mb-4 text-left font-mono text-sm">
                            <div className="flex justify-between"><span>SEAT:</span> <b>{selectedSeat.seatNumber}</b></div>
                            <div className="flex justify-between"><span>CUSTOMER:</span> <b>{customerName.toUpperCase()}</b></div>
                            <div className="flex justify-between"><span>AMOUNT:</span> <b>$150.00</b></div>
                            <div className="flex justify-between"><span>STATUS:</span> <b>PAID</b></div>
                        </div>
                        <div className="bg-black text-white p-4 font-mono text-xs mb-4">
                            FAKE-QR-CODE-88237-XYZ
                        </div>
                        <button onClick={closeReceipt} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">DOWNLOAD TICKET</button>
                    </div>
                </div>
            )}
        </div>
    );
}
