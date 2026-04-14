import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const { user, setActiveAccount, addAccount } = useUser();
  const location = useLocation();
  const [creatingType, setCreatingType] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  const accounts = Array.isArray(user?.accounts)
    ? user.accounts
    : [];

  const activeAccountId = String(user?.activeAccountId || accounts[0]?.id || '');
  const activeAccount =
    accounts.find((account) => String(account.id) === activeAccountId) ||
    accounts[0] ||
    null;

  const accountPayloadByType = useMemo(
    () => ({
      personal: {
        account_type: 'personal',
        account_name: 'Personal Account',
      },
      business: {
        account_type: 'business',
        account_name: 'Business Account',
      },
    }),
    []
  );

  const handleAccountChange = (e) => {
    setActiveAccount(e.target.value);
  };

  const createAccount = async (type) => {
    setAccountError('');
    setAccountSuccess('');
    setCreatingType(type);
    setCreatingAccount(true);

    try {
      const accountTemplate = accountPayloadByType[type];
      const response = await fetch('http://localhost:8000/api/accounts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          ...accountTemplate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create account');
      }

      const data = await response.json();
      const newAccount = {
        id: data.account_id || data.id || data.vpa,
        name: data.account_name || accountTemplate.account_name,
        vpa: data.vpa,
      };

      if (!newAccount.vpa) {
        throw new Error('API did not return a VPA for the new account');
      }

      addAccount(newAccount);
      setAccountSuccess(`${newAccount.name} created: ${newAccount.vpa}`);
    } catch (err) {
      setAccountError(err.message || 'Account creation failed.');
    } finally {
      setCreatingType('');
      setCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        {/* Top Navigation */}
        <div className="bg-white rounded-lg p-2 shadow mb-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/dashboard"
              className={`py-2 text-center rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/history"
              className={`py-2 text-center rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/history'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              History
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hello, {user?.firstName}
            </h1>
            <p className="text-gray-600 text-sm">Welcome back</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0] || 'U'}
          </div>
        </div>

        {/* Balance Card - Placeholder */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6 shadow-lg">
          <p className="text-sm opacity-90">Balance</p>
          <h2 className="text-4xl font-bold mt-2">₹ ****</h2>

          {accounts.length > 1 ? (
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide opacity-80 mb-1">
                Select Account
              </label>
              <select
                value={activeAccountId}
                onChange={handleAccountChange}
                className="w-full bg-blue-700 border border-blue-400 rounded-md px-3 py-2 text-sm text-white focus:outline-none"
              >
                {accounts.map((account, index) => (
                  <option key={account.id || account.vpa || index} value={account.id || account.vpa}>
                    {account.name || `Account ${index + 1}`} - {account.vpa}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm mt-4 opacity-75">{activeAccount?.vpa || 'No VPA found'}</p>
          )}

          {accounts.length > 1 && (
            <p className="text-sm mt-3 opacity-75">Active VPA: {activeAccount?.vpa || 'N/A'}</p>
          )}
        </div>

        {/* Quick Action */}
        <div className="mb-6">
          <Link to="/transfer" className="block bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition">
            <div className="text-2xl mb-2">📤</div>
            <p className="text-sm font-medium">Send Money</p>
          </Link>
        </div>

        {/* Create Accounts */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Create New Account</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => createAccount('personal')}
              disabled={creatingAccount}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {creatingType === 'personal' && creatingAccount ? 'Creating...' : 'New Personal VPA'}
            </button>
            <button
              type="button"
              onClick={() => createAccount('business')}
              disabled={creatingAccount}
              className="px-3 py-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creatingType === 'business' && creatingAccount ? 'Creating...' : 'New Business VPA'}
            </button>
          </div>
          {accountError && (
            <p className="text-sm text-red-600 mt-3">{accountError}</p>
          )}
          {accountSuccess && (
            <p className="text-sm text-green-600 mt-3">{accountSuccess}</p>
          )}
        </div>

        {/* Recent Activity - Placeholder */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm text-center py-4">No recent transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
