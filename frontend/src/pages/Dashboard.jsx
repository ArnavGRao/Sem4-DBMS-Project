import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Breadcrumb from '../components/Breadcrumb';
import { buildAccountVpa, requestJson, addBalanceToAccount, getAccountDetails, fetchTransactionHistory } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setActiveAccount, addAccount, logout, updateBalance, refreshAccountBalance } = useUser();
  const location = useLocation();
  const [creatingType, setCreatingType] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [addBalanceLoading, setAddBalanceLoading] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

    const { showSuccess, showError } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefreshBalance = async () => {
    if (!activeAccount?.id) return;
    
    setRefreshingBalance(true);
    try {
      const details = await getAccountDetails(activeAccount.id);
      refreshAccountBalance(activeAccount.id, parseFloat(details.balance));
      showSuccess('Balance refreshed!');
    } catch (err) {
      console.error('Failed to refresh balance:', err);
      showError('Failed to refresh balance');
    } finally {
      setRefreshingBalance(false);
    }
  };

  const handleAddBalance = async () => {
    if (!addBalanceAmount || parseFloat(addBalanceAmount) <= 0) {
      showError('Please enter a valid amount greater than 0');
      return;
    }

    setAddBalanceLoading(true);

    try {
      const result = await addBalanceToAccount(activeAccount.id, parseFloat(addBalanceAmount));
      
      // Update balance in context
      updateBalance(activeAccount.id, parseFloat(result.new_balance));
      
      // Reset modal
      setShowAddBalanceModal(false);
      setAddBalanceAmount('');
      
      // Show confirmation
      showSuccess(`Added ₹${parseFloat(addBalanceAmount).toFixed(2)} to account!`);
    } catch (err) {
      showError(err.message || 'Failed to add balance');
    } finally {
      setAddBalanceLoading(false);
    }
  };

  const accounts = Array.isArray(user?.accounts)
    ? user.accounts
    : [];

  const activeAccountId = String(user?.activeAccountId || accounts[0]?.id || '');
  const activeAccount =
    accounts.find((account) => String(account.id) === activeAccountId) ||
    accounts[0] ||
    null;

  useEffect(() => {
    const loadRecentTransactions = async () => {
      if (!activeAccount?.vpa) {
        setRecentTransactions([]);
        return;
      }

      setRecentLoading(true);
      try {
        const history = await fetchTransactionHistory(activeAccount.vpa);
        const visibleHistory = Array.isArray(history)
          ? history.filter((txn) => !(String(txn.status || '').toUpperCase() === 'FAILED' && txn.type === 'CREDIT'))
          : [];
        setRecentTransactions(visibleHistory.slice(0, 8));
      } catch {
        setRecentTransactions([]);
      } finally {
        setRecentLoading(false);
      }
    };

    loadRecentTransactions();
  }, [activeAccount?.vpa]);

  const formatCurrency = (amount) => {
    const value = Number(amount || 0);
    return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAccountChange = async (e) => {
    const selectedAccountId = e.target.value;
    setActiveAccount(selectedAccountId);

    setRefreshingBalance(true);
    try {
      const details = await getAccountDetails(selectedAccountId);
      refreshAccountBalance(selectedAccountId, parseFloat(details.balance));
    } catch (err) {
      console.error('Failed to sync selected account balance:', err);
    } finally {
      setRefreshingBalance(false);
    }
  };

  const buildNewAccountVpa = (type) => {
    const baseMobileNumber = user?.mobileNumber || user?.displayName || activeAccount?.vpa?.split('@')[0] || 'account';
    const accountIndex = accounts.length + 1;

    return buildAccountVpa(baseMobileNumber, type, accountIndex);
  };

  const createAccount = async (type) => {
    setCreatingType(type);
    setCreatingAccount(true);

    try {
      const generatedVpa = buildNewAccountVpa(type);
      const data = await requestJson('/api/accounts/create', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id,
          vpa: generatedVpa,
          initial_balance: 0,
        }),
      });
      const newAccount = {
        id: data.account_id || data.id || generatedVpa,
        name: type === 'business' ? 'Business Account' : 'Personal Account',
        vpa: generatedVpa,
        balance: '0.00',
        status: 'Active',
      };

      addAccount(newAccount);
      showSuccess(`${newAccount.name} created: ${newAccount.vpa}`);
    } catch (err) {
      showError(err.message || 'Account creation failed.');
    } finally {
      setCreatingType('');
      setCreatingAccount(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-enter mx-auto w-full max-w-5xl">
        {location.pathname === '/dashboard' && <Breadcrumb items={[{ label: 'Dashboard' }]} />}

        <div className="ui-panel mb-4 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/dashboard"
              className={`rounded-xl py-2 text-center text-sm font-semibold transition-colors ${
                location.pathname === '/dashboard' ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/history"
              className={`rounded-xl py-2 text-center text-sm font-semibold transition-colors ${
                location.pathname === '/history' ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              History
            </Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white/65 p-4">
          <div>
            <h1 className="ui-title text-2xl sm:text-3xl">Hello, {user?.mobileNumber || 'User'}</h1>
            <p className="ui-subtle text-sm">Manage accounts, transfer funds, and track balances.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-cyan-700 text-sm font-bold text-white">
              {(user?.mobileNumber || 'U')[0]}
            </div>
            <button onClick={handleLogout} className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-cyan-700 via-cyan-800 to-slate-900 p-6 text-white shadow-[0_22px_40px_rgba(15,127,143,0.35)]">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Available Balance</p>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
                ₹ {activeAccount?.balance ? parseFloat(activeAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </h2>
            </div>
            <button
              onClick={handleRefreshBalance}
              disabled={refreshingBalance}
              className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 disabled:opacity-60"
              title="Refresh balance"
            >
              {refreshingBalance ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="rounded-xl border border-white/25 bg-white/10 p-3">
            {accounts.length > 1 ? (
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-cyan-100">Select Account</label>
                <select
                  value={activeAccountId}
                  onChange={handleAccountChange}
                  className="w-full rounded-lg border border-white/35 bg-slate-900/25 px-3 py-2 text-sm text-white outline-none"
                >
                  {accounts.map((account, index) => (
                    <option key={account.id || account.vpa || index} value={account.id || account.vpa} className="text-slate-900">
                      {account.name || `Account ${index + 1}`} - {account.vpa}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-cyan-100">VPA</span>
                <span className="font-semibold">{activeAccount?.vpa || 'No VPA found'}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddBalanceModal(true)}
            className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-cyan-800 hover:bg-cyan-50"
          >
            + Add Money
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link to="/transfer" className="ui-panel block p-5 transition-transform hover:-translate-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">Quick Action</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">Send Money</p>
            <p className="mt-1 text-sm text-slate-500">Transfer funds instantly to any VPA.</p>
          </Link>

          <div className="ui-panel p-5">
            <h3 className="text-base font-semibold text-slate-900">Create New Account</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => createAccount('personal')}
                disabled={creatingAccount}
                className="btn-soft px-3 py-2 text-sm"
              >
                {creatingType === 'personal' && creatingAccount ? 'Creating...' : 'Personal'}
              </button>
              <button
                type="button"
                onClick={() => createAccount('business')}
                disabled={creatingAccount}
                className="btn-brand px-3 py-2 text-sm"
              >
                {creatingType === 'business' && creatingAccount ? 'Creating...' : 'Business'}
              </button>
            </div>
          </div>
        </div>

        <div className="ui-panel mt-4 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
            <Link to="/history" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
              View all
            </Link>
          </div>

          {recentLoading ? (
            <p className="mt-4 rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">Loading transactions...</p>
          ) : recentTransactions.length === 0 ? (
            <p className="mt-4 rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">No recent transactions</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((txn) => {
                const isCredit = txn.type === 'CREDIT';
                const isFailed = String(txn.status || '').toUpperCase() === 'FAILED';
                const amountColorClass = isFailed
                  ? 'text-slate-500'
                  : isCredit
                    ? 'text-emerald-600'
                    : 'text-rose-600';
                return (
                  <div key={txn.transaction_id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {isCredit ? `From ${txn.sender_vpa}` : `To ${txn.receiver_vpa}`}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateTime(txn.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${amountColorClass}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{txn.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAddBalanceModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="ui-panel page-enter w-full max-w-md p-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Add Money</h2>
              <button
                onClick={() => {
                  setShowAddBalanceModal(false);
                  setAddBalanceAmount('');
                }}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              VPA: <span className="font-semibold text-slate-900">{activeAccount?.vpa || 'N/A'}</span>
            </p>

            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Amount to Add (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={addBalanceAmount}
                onChange={(e) => setAddBalanceAmount(e.target.value)}
                placeholder="Enter amount"
                className="ui-input"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddBalanceModal(false);
                  setAddBalanceAmount('');
                }}
                className="btn-soft flex-1 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBalance}
                disabled={addBalanceLoading}
                className="btn-brand flex flex-1 items-center justify-center gap-2 px-4 py-2"
              >
                {addBalanceLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {addBalanceLoading ? 'Adding...' : 'Add Money'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
