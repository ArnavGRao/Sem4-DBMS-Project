import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { getAccountDetails, requestJson } from '../lib/api';
import Breadcrumb from '../components/Breadcrumb';

const Transfer = () => {
  const { user, updateBalance, refreshAccountBalance } = useUser();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    toVpa: '',
    amount: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

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

    if (!activeAccount?.vpa) {
      showError('No sender account selected. Create/select an account first.');
      return;
    }

    if (!formData.toVpa || !formData.amount) {
      showError('Beneficiary VPA and amount are required.');
      return;
    }

    const amountAsNumber = Number(formData.amount);
    if (Number.isNaN(amountAsNumber) || amountAsNumber <= 0) {
      showError('Amount must be greater than 0.');
      return;
    }

    if (formData.toVpa === activeAccount.vpa) {
      showError('Cannot transfer to your own account.');
      return;
    }

    setLoading(true);

    try {
      await requestJson('/api/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify({
          sender_vpa: activeAccount.vpa,
          receiver_vpa: formData.toVpa,
          amount: amountAsNumber,
        }),
      });

      // Auto-refresh balance from backend after successful transfer.
      try {
        const latestAccount = await getAccountDetails(activeAccount.id);
        refreshAccountBalance(activeAccount.id, parseFloat(latestAccount.balance));
      } catch {
        // Fallback to optimistic update if refresh fails.
        const currentBalance = Number(activeAccount.balance || 0);
        const newBalance = currentBalance - amountAsNumber;
        updateBalance(activeAccount.id, newBalance);
      }

      showSuccess(`Transfer of ₹${amountAsNumber.toFixed(2)} completed successfully!`);
      setFormData({
        toVpa: '',
        amount: '',
        remarks: '',
      });
    } catch (err) {
      showError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-enter mx-auto w-full max-w-2xl">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Send Money' },
          ]}
        />

        <div className="mb-4 flex items-center justify-between">
          <h1 className="ui-title text-3xl">Send Money</h1>
          <Link to="/dashboard" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="ui-panel p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">From Account (VPA)</label>
              <div className="text-sm font-semibold text-slate-800">{activeAccount?.vpa || 'No account found'}</div>
            </div>

            <div>
              <label htmlFor="toVpa" className="mb-1.5 block text-sm font-semibold text-slate-700">Beneficiary VPA</label>
              <input
                id="toVpa"
                name="toVpa"
                type="text"
                value={formData.toVpa}
                onChange={handleChange}
                placeholder="beneficiary@upi"
                className="ui-input"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="amount" className="mb-1.5 block text-sm font-semibold text-slate-700">Amount (₹)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="ui-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="remarks" className="mb-1.5 block text-sm font-semibold text-slate-700">Remarks</label>
                <input
                  id="remarks"
                  name="remarks"
                  type="text"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Optional note"
                  className="ui-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand mt-2 flex w-full items-center justify-center gap-2 px-4 py-3"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? 'Processing...' : 'Transfer Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
