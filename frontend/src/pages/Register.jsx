import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { buildAccountVpa, requestJson } from '../lib/api';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [vpa, setVpa] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const primaryVpa = formData.mobileNumber.length === 10
    ? buildAccountVpa(formData.mobileNumber, 'primary', 1)
    : '';

  useEffect(() => {
    setVpa(primaryVpa);
  }, [primaryVpa]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.mobileNumber || !formData.password || !formData.confirmPassword) {
      showError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.mobileNumber.length !== 10 || !/^\d{10}$/.test(formData.mobileNumber)) {
      showError('Mobile number must be 10 digits');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      showError('Please accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const registration = await requestJson('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({
          phone: formData.mobileNumber,
          password: formData.password,
        }),
      });

      const account = await requestJson('/api/accounts/create', {
        method: 'POST',
        body: JSON.stringify({
          user_id: registration.user_id,
          vpa: primaryVpa,
          initial_balance: 0,
        }),
      });

      const accounts = [{
        id: account.account_id,
        name: 'Primary Account',
        vpa: primaryVpa,
      }];

      login({
        id: registration.user_id,
        mobileNumber: formData.mobileNumber,
        accounts,
        activeAccountId: accounts[0]?.id || null,
      }, 'user');

      showSuccess('Account created successfully! Redirecting...');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell grid place-items-center">
      <div className="page-enter w-full max-w-xl">
        <section className="ui-panel p-6 text-left sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Sign up</p>
            <h2 className="ui-title mt-2 text-3xl">Create account</h2>
            <p className="ui-subtle mt-2 text-sm">Set up your profile in less than a minute.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="mobileNumber" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mobile Number
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-sm text-gray-600">
                  +91
                </span>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className="ui-input rounded-l-none"
                  required
                />
              </div>
            </div>

            {vpa && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Generated VPA</p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">{vpa}</p>
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-semibold text-cyan-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="ui-input"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="ui-input"
                required
              />
            </div>

            <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5"
                required
              />
              <span>
                I agree to the <span className="font-semibold text-cyan-700">Terms & Conditions</span>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand mt-2 flex w-full items-center justify-center gap-2 px-4 py-3"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 h-px bg-slate-200" />

          <Link to="/login" className="btn-soft block w-full px-4 py-3 text-center text-sm">
            Sign In Instead
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Register;
