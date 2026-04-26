import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { fetchTransactionHistory, verifyUserPassword } from '../lib/api';
import { getHiddenTransactionIds, hideTransactions, unhideTransaction } from '../lib/transactionPrivacy';

const History = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showError, showSuccess } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [hiddenTransactionIds, setHiddenTransactionIds] = useState([]);
  const [isHiddenView, setIsHiddenView] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedToHide, setSelectedToHide] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordAction, setPasswordAction] = useState(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const accounts = Array.isArray(user?.accounts) ? user.accounts : [];
  const activeAccount =
    accounts.find((account) => String(account.id) === String(user?.activeAccountId)) ||
    accounts[0] ||
    null;

  useEffect(() => {
    setHiddenTransactionIds(getHiddenTransactionIds(user?.id, activeAccount?.vpa));
  }, [user?.id, activeAccount?.vpa]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!activeAccount?.vpa) {
        setTransactions([]);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchTransactionHistory(activeAccount.vpa);
        setTransactions(Array.isArray(data) ? data : []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [activeAccount?.vpa]);

  const baseVisibleTransactions = useMemo(
    () => transactions.filter((txn) => !(String(txn.status || '').toUpperCase() === 'FAILED' && txn.type === 'CREDIT')),
    [transactions]
  );

  const hiddenIdSet = useMemo(
    () => new Set((hiddenTransactionIds || []).map((id) => String(id))),
    [hiddenTransactionIds]
  );

  const visibleTransactions = useMemo(
    () => baseVisibleTransactions.filter((txn) => !hiddenIdSet.has(String(txn.transaction_id))),
    [baseVisibleTransactions, hiddenIdSet]
  );

  const hiddenTransactions = useMemo(
    () => baseVisibleTransactions.filter((txn) => hiddenIdSet.has(String(txn.transaction_id))),
    [baseVisibleTransactions, hiddenIdSet]
  );

  const transactionsForView = isHiddenView ? hiddenTransactions : visibleTransactions;

  const filteredTransactions = useMemo(() => {
    if (filter === 'sent') {
      return transactionsForView.filter((txn) => txn.type === 'DEBIT');
    }
    if (filter === 'received') {
      return transactionsForView.filter((txn) => txn.type === 'CREDIT');
    }
    if (filter === 'failed') {
      return transactionsForView.filter((txn) => String(txn.status || '').toUpperCase() === 'FAILED');
    }
    return transactionsForView;
  }, [transactionsForView, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  useEffect(() => {
    setPage(1);
    setSelectedToHide([]);
  }, [filter, pageSize, activeAccount?.vpa, isHiddenView]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageTransactions = filteredTransactions.slice(startIndex, endIndex);

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

  const from = filteredTransactions.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + currentPageTransactions.length, filteredTransactions.length);

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordAction(null);
    setIsVerifyingPassword(false);
  };

  const verifyPasswordForCurrentUser = async (password) => {
    if (!password) {
      showError('Password is required');
      return false;
    }

    const identifier = user?.mobileNumber || activeAccount?.vpa;
    const verified = await verifyUserPassword({ identifier, password });
    if (!verified) {
      showError('Invalid password');
      return false;
    }

    return true;
  };

  const openPasswordModal = (action) => {
    setPasswordAction(action);
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const handleConfirmPassword = async () => {
    const trimmedPassword = passwordInput.trim();
    if (!trimmedPassword) {
      showError('Password is required');
      return;
    }

    setIsVerifyingPassword(true);
    const ok = await verifyPasswordForCurrentUser(trimmedPassword);
    if (!ok) {
      setIsVerifyingPassword(false);
      return;
    }

    if (passwordAction === 'hide') {
      setIsSelectionMode(true);
      setSelectedToHide([]);
    }

    if (passwordAction === 'hidden') {
      setIsHiddenView(true);
      setIsSelectionMode(false);
      setSelectedToHide([]);
    }

    closePasswordModal();
  };

  const handleEnableSelectionMode = async () => {
    openPasswordModal('hide');
  };

  const handleHideSelected = () => {
    if (selectedToHide.length === 0) {
      showError('Select at least one transaction to hide');
      return;
    }

    const next = hideTransactions(user?.id, activeAccount?.vpa, selectedToHide);
    setHiddenTransactionIds(next);
    setSelectedToHide([]);
    setIsSelectionMode(false);
    showSuccess(`${selectedToHide.length} transaction(s) hidden`);
  };

  const handleToggleHiddenView = async () => {
    if (isHiddenView) {
      setIsHiddenView(false);
      setIsSelectionMode(false);
      setSelectedToHide([]);
      return;
    }

    openPasswordModal('hidden');
  };

  const toggleSelectedTransaction = (transactionId) => {
    const normalizedId = String(transactionId);
    setSelectedToHide((prev) => (
      prev.includes(normalizedId)
        ? prev.filter((id) => id !== normalizedId)
        : [...prev, normalizedId]
    ));
  };

  const handleUnhide = (transactionId) => {
    const next = unhideTransaction(user?.id, activeAccount?.vpa, transactionId);
    setHiddenTransactionIds(next);
    showSuccess('Transaction unhidden');
  };

  return (
    <div className="app-shell">
      <div className="page-enter mx-auto w-full max-w-4xl">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'History' },
          ]}
        />

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="ui-title text-3xl">Transaction History</h1>
            <p className="ui-subtle mt-1 text-sm">
              {isHiddenView ? 'Viewing hidden transactions.' : 'Recent payment activity will be shown here.'}
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-soft px-4 py-2 text-sm">
            Back to Dashboard
          </button>
        </div>

        <div className="ui-panel mb-4 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between">
            <div className="flex min-h-[84px] flex-col justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    filter === 'all' ? 'bg-cyan-700 text-white' : 'btn-soft'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('sent')}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    filter === 'sent' ? 'bg-cyan-700 text-white' : 'btn-soft'
                  }`}
                >
                  Sent
                </button>
                <button
                  onClick={() => setFilter('received')}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    filter === 'received' ? 'bg-cyan-700 text-white' : 'btn-soft'
                  }`}
                >
                  Received
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    filter === 'failed' ? 'bg-cyan-700 text-white' : 'btn-soft'
                  }`}
                >
                  Failed
                </button>
              </div>

              <p className="text-sm text-slate-500">
                Showing {from}-{to} of {filteredTransactions.length}
              </p>
            </div>

            <div className="flex min-h-[84px] flex-col items-start justify-between gap-2">
              <button onClick={handleToggleHiddenView} className="btn-soft px-4 py-2 text-sm">
                {isHiddenView ? 'Back to History' : 'View Hidden Transactions'}
              </button>

              {!isHiddenView && (
                isSelectionMode ? (
                  <div className="flex items-center gap-2">
                    <button onClick={handleHideSelected} className="btn-brand px-4 py-2 text-sm">
                      Hide Selected ({selectedToHide.length})
                    </button>
                    <button
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedToHide([]);
                      }}
                      className="btn-soft px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEnableSelectionMode} className="btn-soft px-4 py-2 text-sm">
                    Hide Transactions
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="ui-panel p-4 sm:p-5">
          {loading ? (
            <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">Loading transactions...</p>
          ) : currentPageTransactions.length === 0 ? (
            <div className="p-6 text-center">
              {isHiddenView ? (
                <>
                  <p className="text-lg font-semibold text-slate-800">No Hidden Transactions</p>
                  <p className="mt-1 text-sm text-slate-500">Transactions you hide will appear here.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-slate-800">No Transactions Yet</p>
                  <p className="mt-1 text-sm text-slate-500">Your transaction history will appear once you start sending or receiving money.</p>
                  <Link to="/transfer" className="btn-brand mt-6 inline-flex px-6 py-2.5 text-sm">
                    Send Money Now
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {currentPageTransactions.map((txn) => {
                const isCredit = txn.type === 'CREDIT';
                const isFailed = String(txn.status || '').toUpperCase() === 'FAILED';
                const amountColorClass = isFailed
                  ? 'text-slate-500'
                  : isCredit
                    ? 'text-emerald-600'
                    : 'text-rose-600';
                return (
                  <div key={txn.transaction_id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      {isSelectionMode && !isHiddenView && (
                        <div className="flex h-full items-center pt-1">
                          <input
                            type="checkbox"
                            checked={selectedToHide.includes(String(txn.transaction_id))}
                            onChange={() => toggleSelectedTransaction(txn.transaction_id)}
                            className="h-4 w-4"
                          />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {isCredit ? `From ${txn.sender_vpa}` : `To ${txn.receiver_vpa}`}
                        </p>
                        <p className="text-xs text-slate-500">{formatDateTime(txn.created_at)}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className={`text-sm font-semibold ${amountColorClass}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{txn.status}</p>
                      {isHiddenView && (
                        <button
                          onClick={() => handleUnhide(txn.transaction_id)}
                          className="mt-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                        >
                          Unhide
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-3 items-center gap-3">
            <div className="flex justify-start">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="btn-soft px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
            </div>

            <p className="text-center text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="btn-soft px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Per page
              <input
                type="number"
                min="1"
                max="500"
                value={pageSize}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value)) return;
                  setPageSize(Math.min(500, Math.max(1, Math.trunc(value))));
                }}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
              />
            </label>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="ui-panel page-enter w-full max-w-md p-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Confirm Password</h2>
              <button onClick={closePasswordModal} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
                ×
              </button>
            </div>

            <p className="mb-3 text-sm text-slate-600">
              Enter your password to continue.
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmPassword();
                }
              }}
              placeholder="Enter password"
              className="ui-input"
              autoFocus
            />

            <div className="mt-5 flex gap-3">
              <button onClick={closePasswordModal} className="btn-soft flex-1 px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleConfirmPassword}
                disabled={isVerifyingPassword}
                className="btn-brand flex flex-1 items-center justify-center gap-2 px-4 py-2"
              >
                {isVerifyingPassword && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {isVerifyingPassword ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
