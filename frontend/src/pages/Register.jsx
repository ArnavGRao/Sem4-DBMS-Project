import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
  });
  const [vpa, setVpa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate VPA based on mobile number
  useEffect(() => {
    if (formData.mobileNumber.length === 10) {
      const generatedVpa = `${formData.mobileNumber}@yourbank`;
      setVpa(generatedVpa);
    } else {
      setVpa('');
    }
  }, [formData.mobileNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.fullName || !formData.mobileNumber || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.mobileNumber.length !== 10 || !/^\d{10}$/.test(formData.mobileNumber)) {
      setError('Mobile number must be 10 digits');
      setLoading(false);
      return;
    }

    try {
      // API call placeholder - replace with actual backend endpoint
      const response = await fetch('http://localhost:8000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          password: formData.password,
          vpa: vpa,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();

      const accounts = Array.isArray(data.accounts) && data.accounts.length > 0
        ? data.accounts
        : [{
            id: 'primary',
            name: 'Primary Account',
            vpa: data.vpa || vpa,
          }];

      // Update context with new user data
      login({
        id: data.user_id,
        firstName: formData.fullName,
        email: formData.email,
        accounts,
        activeAccountId: accounts[0]?.id || null,
      }, 'user');

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">UPI</h1>
            <p className="text-gray-600 text-sm mt-1">Create New Account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Mobile Number Input */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* VPA Display (Read-only) */}
            {vpa && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your VPA
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-semibold text-sm">
                  {vpa}
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated based on your mobile number</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
