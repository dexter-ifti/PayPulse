import { useState, useCallback, useRef } from 'react'
import { Heading, SubHeading, InputBox, Button, BottomWarning } from '../components'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'
import { Turnstile } from '@marsidev/react-turnstile'

// --- Validation helpers ---
const validators = {
  firstName: (value) => {
    if (!value.trim()) return 'First name is required';
    if (value.trim().length < 3) return 'First name must be at least 3 characters';
    return '';
  },
  lastName: (value) => {
    if (!value.trim()) return 'Last name is required';
    if (value.trim().length < 3) return 'Last name must be at least 3 characters';
    return '';
  },
  username: (value) => {
    if (!value.trim()) return 'Email is required';
    if (value.trim().length < 5) return 'Email must be at least 5 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
    return '';
  },
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 5) return 'Password must be at least 5 characters';
    return '';
  },
};

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);
  const navigate = useNavigate();

  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Note: Authentication is now handled via httpOnly cookies
  // Route protection is handled by backend session validation

  const getFieldValue = useCallback((field) => {
    switch (field) {
      case 'firstName': return firstName;
      case 'lastName': return lastName;
      case 'username': return username;
      case 'password': return password;
      default: return '';
    }
  }, [firstName, lastName, username, password]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = getFieldValue(field);
    const error = validators[field](value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [getFieldValue]);

  const handleChange = useCallback((field, value, setter) => {
    setter(value);
    // Only validate on change if the field has already been touched (blurred)
    if (touched[field]) {
      const error = validators[field](value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [touched]);

  const validateAll = useCallback(() => {
    const newErrors = {
      firstName: validators.firstName(firstName),
      lastName: validators.lastName(lastName),
      username: validators.username(username),
      password: validators.password(password),
    };
    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, username: true, password: true });
    return !Object.values(newErrors).some(Boolean);
  }, [firstName, lastName, username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateAll()) return;

    // Check turnstile verification
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error("Please verify you're not a robot");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Creating account… Server may take a moment to start up.');

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/signup`, {
        firstName,
        lastName,
        username,
        password,
        turnstileToken
      });

      toast.dismiss(loadingToast);
      // Signup successful — redirect to signin page
      toast.success(response.data.message || 'Account created successfully! Please sign in.');
      navigate('/signin', { state: { username } });
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      // Reset turnstile for next attempt
      if (turnstileRef.current) turnstileRef.current.reset();
      setTurnstileToken(null);
      setSubmitting(false);
    }
  };

  const passwordError = touched.password && errors.password;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4 overflow-hidden'>
      {/* Ambient background — pulse only when motion is welcome */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl motion-safe:animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl motion-safe:animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex flex-col justify-center relative z-10 w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg">
              P
            </div>
            <span className="text-3xl font-bold text-white">PayPulse</span>
          </div>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 w-full text-center p-8 shadow-2xl'>
          {/* Decorative top accent — anchored to the card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600" aria-hidden="true"></div>

          <Heading label={"Sign up"} />
          <SubHeading label={"Enter your information to create an account"} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 mt-6">
              <InputBox
                onChange={e => handleChange('firstName', e.target.value, setFirstName)}
                onBlur={() => handleBlur('firstName')}
                error={touched.firstName ? errors.firstName : ''}
                label={"First name"}
                placeholder={"John"}
                name="given-name"
                autoComplete="given-name"
                required
              />
              <InputBox
                onChange={e => handleChange('lastName', e.target.value, setLastName)}
                onBlur={() => handleBlur('lastName')}
                error={touched.lastName ? errors.lastName : ''}
                label={"Last name"}
                placeholder={"Doe"}
                name="family-name"
                autoComplete="family-name"
                required
              />
              <InputBox
                onChange={e => handleChange('username', e.target.value, setUserName)}
                onBlur={() => handleBlur('username')}
                error={touched.username ? errors.username : ''}
                label={"Email"}
                placeholder={"you@example.com"}
                type="email"
                name="email"
                autoComplete="email"
                required
              />
              <div className='text-left'>
                <label htmlFor="signup-password" className='block text-sm font-medium text-gray-300 mb-2'>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="new-password"
                    onChange={e => handleChange('password', e.target.value, setPassword)}
                    onBlur={() => handleBlur('password')}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder={"At least 5 characters"}
                    aria-invalid={passwordError ? 'true' : 'false'}
                    aria-describedby={passwordError ? 'signup-password-error' : undefined}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border bg-slate-700/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      passwordError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-600 focus:ring-orange-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-orange-500 focus:outline-none focus-visible:text-orange-400 rounded-r-xl transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="signup-password-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 motion-safe:animate-[fadeSlideIn_0.2s_ease-out]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Cloudflare Turnstile */}
            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center mt-5">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onError={() => {
                    setTurnstileToken(null);
                    toast.error('Verification failed. Please try again.');
                  }}
                  onExpire={() => setTurnstileToken(null)}
                  options={{
                    theme: 'dark',
                    size: 'normal',
                  }}
                />
              </div>
            )}

            <div className="pt-6">
              <Button type="submit" loading={submitting} label={submitting ? "Creating account…" : "Sign up"} />
            </div>
          </form>

          <BottomWarning
            label={"Already have an account?"}
            buttonText={"Sign in"}
            to={'/signin'}
          />
        </div>

        {/* Security note */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 text-orange-400 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H6.75a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5z" />
            </svg>
            Secure &amp; encrypted
          </span>
        </div>
      </div>
    </div>
  )
}

export default Signup
