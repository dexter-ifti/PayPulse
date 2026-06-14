import axios from "axios";
import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import toast from 'react-hot-toast'

const MAX_TRANSFER = 1000000; // ₹10,00,000 per transfer — fat-finger guard

const validateAmount = (value) => {
  if (value === '' || value === null || value === undefined) return 'Amount is required';
  const num = Number(value);
  if (!Number.isFinite(num)) return 'Enter a valid amount';
  if (num <= 0) return 'Amount must be greater than 0';
  if (num > MAX_TRANSFER) return 'Amount can’t exceed ₹10,00,000 per transfer';
  return '';
};

const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);

  // Guard: a recipient (id + name) must be present. Direct navigation, a
  // refresh, or a stale bookmark can land here without params — show a
  // recovery state instead of crashing on name[0].
  if (!id || !name) {
    return <NoRecipient />;
  }

  // Surrogate-pair-safe first character (handles emoji / CJK names).
  const recipientInitial = [...name][0].toUpperCase();

  const handleTransfer = async () => {
    const error = validateAmount(amount);
    setAmountError(error);
    setAmountTouched(true);
    if (error) return;

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/account/transfer`, {
        to: id,
        amount: Number(amount)
      }, {
        withCredentials: true // Send cookies with request
      });
      toast.success("Transfer successful!");
      navigate('/dashboard');
    } catch (err) {
      // Session expired / not authenticated — send them back to sign in.
      if (err.response?.status === 401) {
        toast.error('Your session expired. Please sign in again.');
        navigate('/signin');
        return;
      }
      toast.error(err.response?.data?.message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTransfer();
  };

  const showError = amountTouched && Boolean(amountError);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4 overflow-hidden">
      {/* Ambient background — pulse only when motion is welcome */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl motion-safe:animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl motion-safe:animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg">
              P
            </div>
            <span className="text-2xl font-bold text-white">PayPulse</span>
          </div>
        </div>

        <div className="relative rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-2xl overflow-hidden">
          {/* Decorative top accent — anchored to the card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600" aria-hidden="true"></div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-center text-white mb-8">Send Money</h1>

            {/* Recipient — long names truncate instead of overflowing */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold" aria-hidden="true">{recipientInitial}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-300">Sending to</p>
                <h2 className="text-xl font-semibold text-white truncate" title={name}>{name}</h2>
              </div>
            </div>

            {/* Amount */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300" htmlFor="amount">
                  Amount (in ₹)
                </label>
                <input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (amountTouched) setAmountError(validateAmount(e.target.value));
                  }}
                  onBlur={() => {
                    setAmountTouched(true);
                    setAmountError(validateAmount(amount));
                  }}
                  type="number"
                  inputMode="decimal"
                  className={`flex h-12 w-full rounded-xl border bg-slate-700/50 px-4 py-2 text-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-60 ${
                    showError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-orange-500'
                  }`}
                  id="amount"
                  placeholder="Enter amount"
                  min="1"
                  max={MAX_TRANSFER}
                  step="any"
                  required
                  aria-invalid={showError ? 'true' : 'false'}
                  aria-describedby={showError ? 'amount-error' : undefined}
                  disabled={loading}
                />
                {showError && (
                  <p id="amount-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 motion-safe:animate-[fadeSlideIn_0.2s_ease-out]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {amountError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 motion-safe:hover:scale-[1.02] transition-all duration-200 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? "Processing…" : "Initiate Transfer"}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                className="w-full h-12 bg-slate-700/50 text-white rounded-xl font-semibold hover:bg-slate-600/50 transition-colors duration-200 border border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 text-orange-400 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H6.75a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5z" />
            </svg>
            Secure transaction
          </span>
        </div>
      </div>
    </div>
  );
};

// Recovery state when the page is reached without a selected recipient.
function NoRecipient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-2xl p-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-slate-300" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">No recipient selected</h1>
          <p className="text-gray-300 mt-2 text-pretty">
            Pick someone from your dashboard to send money to, and we’ll bring you right back here.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 shadow-lg motion-safe:hover:scale-[1.02] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Go to dashboard
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SendMoney;
