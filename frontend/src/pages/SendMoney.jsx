import axios from "axios";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"
import toast from 'react-hot-toast'

const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);

  const validateAmount = (value) => {
    if (!value || value === '0') return 'Amount is required';
    if (Number(value) <= 0) return 'Amount must be greater than 0';
    return '';
  };

  const handleTransfer = async () => {
    const error = validateAmount(amount);
    setAmountError(error);
    setAmountTouched(true);
    if (error) return;

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/account/transfer`, {
        to: id,
        amount
      }, {
        withCredentials: true // Send cookies with request
      });
      toast.success("Transfer successful!");
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4 overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg">
              P
            </div>
            <span className="text-2xl font-bold text-white">PayPulse</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-2xl hover:border-orange-500/50 transition-all duration-300">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-t-2xl"></div>

          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Send Money</h2>

            {/* Recipient Info */}
            <div className="flex items-center space-x-4 mb-8 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold">{name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Sending to</p>
                <h3 className="text-xl font-semibold text-white">{name}</h3>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-300"
                  htmlFor="amount"
                >
                  Amount (in Rs)
                </label>
                <input
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (amountTouched) setAmountError(validateAmount(e.target.value));
                  }}
                  onBlur={() => {
                    setAmountTouched(true);
                    setAmountError(validateAmount(amount));
                  }}
                  type="number"
                  className={`flex h-12 w-full rounded-xl border bg-slate-700/50 px-4 py-2 text-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    amountTouched && amountError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-orange-500'
                  }`}
                  id="amount"
                  placeholder="Enter amount"
                  min="1"
                />
                {amountTouched && amountError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-[fadeSlideIn_0.2s_ease-out]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {amountError}
                  </p>
                )}
              </div>

              <button
                onClick={handleTransfer}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Processing..." : "Initiate Transfer"}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 bg-slate-700/50 text-white rounded-xl font-semibold hover:bg-slate-600/50 transition-all duration-300 border border-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-slate-800/30 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-700">
            <span className="text-orange-400 text-sm font-semibold">🔒 Secure Transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
