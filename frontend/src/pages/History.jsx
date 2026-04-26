import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { useUser } from '../context/UserContext';
import { fetchTransactionHistory } from '../lib/api';

const History = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const accounts = Array.isArray(user?.accounts) ? user.accounts : [];
  const activeAccount =
    accounts.find((account) => String(account.id) === String(user?.activeAccountId)) ||
    accounts[0] ||
    null;

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

  const visibleTransactions = useMemo(
    () => transactions.filter((txn) => !(String(txn.status || '').toUpperCase() === 'FAILED' && txn.type === 'CREDIT')),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    if (filter === 'sent') {
      return visibleTransactions.filter((txn) => txn.type === 'DEBIT');
    }
    if (filter === 'received') {
      return visibleTransactions.filter((txn) => txn.type === 'CREDIT');
    }
    if (filter === 'failed') {
      return visibleTransactions.filter((txn) => String(txn.status || '').toUpperCase() === 'FAILED');
    }
    return visibleTransactions;
  }, [visibleTransactions, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize, activeAccount?.vpa]);

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
            <p className="ui-subtle mt-1 text-sm">Recent payment activity will be shown here.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-soft px-4 py-2 text-sm">
            Back
          </button>
        </div>

        <div className="ui-panel mb-4 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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

          <p className="text-sm text-slate-500">
            Showing {from}-{to} of {filteredTransactions.length}
          </p>
        </div>

        <div className="ui-panel p-4 sm:p-5">
          {loading ? (
            <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">Loading transactions...</p>
          ) : currentPageTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-semibold text-slate-800">No Transactions Yet</p>
              <p className="mt-1 text-sm text-slate-500">Your transaction history will appear once you start sending or receiving money.</p>
              <Link to="/transfer" className="btn-brand mt-6 inline-flex px-6 py-2.5 text-sm">
                Send Money Now
              </Link>
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
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {isCredit ? `From ${txn.sender_vpa}` : `To ${txn.receiver_vpa}`}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateTime(txn.created_at)}</p>
                    </div>

                    <div className="text-left sm:text-right">
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="btn-soft px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <p className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </p>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="btn-soft px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
