import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import logo from 'D:\\AI_JOB_APP\\frontend\\aijobapp\\src\\components\\images\\logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const validateForm = () => {
    const newErrors = {};
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) newErrors.username = 'Username is required';
    if (!trimmedPassword) newErrors.password = 'Password is required';
    else if (trimmedPassword.length < 6) newErrors.password = 'Password must be at least 6 characters';

    return newErrors;
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
    const trimmedPassword = password.trim();

    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: trimmedUsername,
        password: trimmedPassword,
      });

      console.log('Login response:', response.data);
      // Store JWT token and username in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', trimmedUsername);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('Login successful!');
      history.push('/job'); // Redirect to dashboard
    } catch (error) {
      if (error.response) {
        console.error('Login error response:', error.response);
        setErrors({ form: error.response.data.message || 'Login failed.' });
      } else if (error.request) {
        console.error('Login error request:', error.request);
        setErrors({ form: 'Server is not responding.' });
      } else {
        console.error('Login error:', error.message);
        setErrors({ form: 'Unexpected error. Please try again.' });
      }
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 box-border">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100/20 shadow-xl p-10 text-center animate-fadeIn">
        <img
          src={logo}
          alt="JobTrack AI Logo"
          className="w-28 h-auto mx-auto mb-8 object-contain animate-scaleIn"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/120?text=JobTrack+AI+Logo')}
        />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 font-sans">Log In to JobTrack AI</h2>
        
        {errors.form && (
          <p className="text-red-500 text-sm mb-4 p-2 bg-red-500/10 rounded animate-fadeInError">
            {errors.form}
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
              className={`w-full py-3.5 px-4 rounded-lg text-base text-gray-900 outline-none transition-all duration-200 bg-gray-50 ${
                errors.username ? 'border border-red-500' : 'border border-gray-300'
              } focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10`}
              placeholder="Enter your username"
              autoFocus
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1.5 animate-fadeInError font-sans">
                {errors.username}
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
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-3.5 px-4 pr-10 rounded-lg text-base text-gray-900 outline-none transition-all duration-200 bg-gray-50 ${
                  errors.password ? 'border border-red-500' : 'border border-gray-300'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-600 text-lg"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 animate-fadeInError font-sans">
                {errors.password}
              </p>
            )}
          </div>
          
          <div className="text-right mb-6 w-full">
            <a
              href="#forgot-password"
              className="text-amber-600 no-underline text-sm font-medium transition-all duration-200 hover:text-amber-700 hover:underline font-sans"
            >
              Forgot Password?
            </a>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3.5 px-4 rounded-lg text-base font-semibold border-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-amber-600/30 hover:-translate-y-0.5 font-sans"
          >
            Log In
          </button>
        </form>
        
        <p className="text-sm text-gray-600 mt-5 font-sans">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-600 font-medium no-underline transition-colors duration-200 hover:text-amber-700 cursor-pointer">
            Sign Up
          </Link>
        </p>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInError {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-fadeInError {
          animation: fadeInError 0.3s ease-out;
        }
        
        @media (max-width: 768px) {
          .max-w-md {
            max-width: 90% !important;
            padding: 24px !important;
          }
          h2 {
            font-size: 28px !important;
          }
          input, button[type="submit"] {
            font-size: 14px !important;
            padding: 12px !important;
          }
          img {
            width: 100px !important;
          }
          label, p, a, span {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;