import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png'; // Adjust path as needed


const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const history = useHistory();

  const evaluatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (password.length === 0) return null;
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) newErrors.username = 'Username is required';
    if (!trimmedEmail) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = 'Invalid email format';
    if (!trimmedPassword) newErrors.password = 'Password is required';
    else if (trimmedPassword.length < 8) newErrors.password = 'Password must be at least 8 characters';

    return newErrors;
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    const strength = evaluatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log('Signup response:', response.data);
      alert('User created successfully');
      history.push('/login');
    } catch (error) {
      if (error.response) {
        console.error('Signup error response:', error.response);
        setErrors({
          form: error.response.data.message || 'Signup failed.',
          details: error.response.data.details || '',
        });
      } else if (error.request) {
        console.error('Signup error request:', error.request);
        setErrors({ form: 'Server is not responding.' });
      } else {
        console.error('Signup error:', error.message);
        setErrors({ form: 'Unexpected error. Please try again.' });
      }
    }
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength) {
      case 'Weak': return 'bg-red-500';
      case 'Medium': return 'bg-amber-500';
      case 'Strong': return 'bg-emerald-500';
      default: return '';
    }
  };

  const getStrengthWidth = () => {
    if (!passwordStrength) return 'w-0';
    switch (passwordStrength) {
      case 'Weak': return 'w-1/3';
      case 'Medium': return 'w-2/3';
      case 'Strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const getStrengthTextColor = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength) {
      case 'Weak': return 'text-red-500';
      case 'Medium': return 'text-amber-500';
      case 'Strong': return 'text-emerald-500';
      default: return '';
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 box-border overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-10 text-center animate-fadeIn">
        <img
          src={logo}
          alt="JobTrack AI Logo"
          className="w-32 h-auto mx-auto mb-8 object-contain animate-scaleIn"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/120?text=JobTrack+AI+Logo')}
        />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 font-sans">Sign Up for JobTrack AI</h2>

        {errors.form && (
          <p className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded animate-fadeInError">
            {errors.form}
            {errors.details && <span className="block mt-1">{errors.details}</span>}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          <div className="mb-5 w-full text-left">
            <label htmlFor="username" className="text-base font-medium text-gray-600 mb-2 block font-sans">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-3.5 rounded-lg text-base text-gray-900 outline-none transition-all duration-200 bg-gray-50 box-border focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 ${errors.username ? 'border border-red-500' : 'border border-gray-300'}`}
              placeholder="Enter your username"
              autoFocus
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1.5 animate-fadeInError font-sans">
                {errors.username}
              </p>
            )}
          </div>

          <div className="mb-5 w-full text-left">
            <label htmlFor="email" className="text-base font-medium text-gray-600 mb-2 block font-sans">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3.5 rounded-lg text-base text-gray-900 outline-none transition-all duration-200 bg-gray-50 box-border focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 ${errors.email ? 'border border-red-500' : 'border border-gray-300'}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1.5 animate-fadeInError font-sans">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-5 w-full text-left">
            <label htmlFor="password" className="text-base font-medium text-gray-600 mb-2 block font-sans">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full p-3.5 rounded-lg text-base text-gray-900 outline-none transition-all duration-200 bg-gray-50 pr-10 box-border focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 ${errors.password ? 'border border-red-500' : 'border border-gray-300'}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-600 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21"
                    />
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-3 w-full">
                <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
                  <div
                    className={`h-1.5 rounded transition-all duration-500 animate-stretchIn ${getStrengthColor()} ${getStrengthWidth()}`}
                  ></div>
                </div>

                <div className="mt-1.5 flex items-center">
                  <span
                    className={`text-sm font-medium flex items-center animate-slideRight ${getStrengthTextColor()}`}
                  >
                    {passwordStrength === 'Weak' && (
                      <span className="inline-block mr-1">⚠️</span>
                    )}
                    {passwordStrength === 'Medium' && (
                      <span className="inline-block mr-1">✓</span>
                    )}
                    {passwordStrength === 'Strong' && (
                      <span className="inline-block mr-1">✓✓</span>
                    )}
                    &nbsp;{passwordStrength} Password
                  </span>
                </div>
              </div>
            )}

            {passwordStrength === 'Weak' && (
              <div className="mt-2.5 p-2.5 bg-red-50 rounded-md animate-fadeIn">
                <p className="m-0 text-sm text-red-500">
                  Tips to improve:
                </p>
                <ul className="pl-5 mt-1 mb-0">
                  <li className="text-xs mt-1 text-red-500">Add uppercase letters (A-Z)</li>
                  <li className="text-xs mt-1 text-red-500">Add numbers (0-9)</li>
                  <li className="text-xs mt-1 text-red-500">Add special characters (!@#$)</li>
                </ul>
              </div>
            )}

            {errors.password && (
              <p className="text-red-500 text-sm mt-1.5 animate-fadeInError font-sans">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white p-3.5 rounded-lg text-base font-semibold border-none cursor-pointer transition-all duration-200 hover:translate-y-0.5 hover:shadow-lg hover:shadow-amber-600/30 font-sans"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 font-medium no-underline transition-colors duration-200 hover:text-amber-700 cursor-pointer">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;