import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Transfer = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    toVpa: '',
    amount: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const accounts = Array.isArray(user?.accounts) ? user.accounts : [];
  const activeAccount = useMemo(
    () =>
      accounts.find((account) => String(account.id) === String(user?.activeAccountId)) ||
      accounts[0] ||
      null,
    [accounts, user?.activeAccountId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!activeAccount?.vpa) {
      setError('No sender account selected. Create/select an account first.');
      return;
    }

    if (!formData.toVpa || !formData.amount) {
      setError('Beneficiary VPA and amount are required.');
      return;
    }

    const amountAsNumber = Number(formData.amount);
    if (Number.isNaN(amountAsNumber) || amountAsNumber <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_vpa: activeAccount.vpa,
          to_vpa: formData.toVpa,
          amount: amountAsNumber,
          remarks: formData.remarks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Transfer failed');
      }

      const data = await response.json();
      setSuccess(`Transfer successful. Reference: ${data.transaction_id || data.reference || 'N/A'}`);
      setFormData({
        toVpa: '',
        amount: '',
        remarks: '',
      });
    } catch (err) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Send Money</h1>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Account (VPA)</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm">
                {activeAccount?.vpa || 'No account found'}
              </div>
            </div>

            <div>
              <label htmlFor="toVpa" className="block text-sm font-medium text-gray-700 mb-1">Beneficiary VPA</label>
              <input
                id="toVpa"
                name="toVpa"
                type="text"
                value={formData.toVpa}
                onChange={handleChange}
                placeholder="beneficiary@bank"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
              <input
                id="remarks"
                name="remarks"
                type="text"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="e.g. lunch split"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Transferring...' : 'Transfer Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
