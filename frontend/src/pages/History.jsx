import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const History = () => {
  const navigate = useNavigate();

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
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-cyan-700 px-4 py-1.5 text-sm font-semibold text-white">All</button>
            <button className="btn-soft rounded-full px-4 py-1.5 text-sm">Sent</button>
            <button className="btn-soft rounded-full px-4 py-1.5 text-sm">Received</button>
            <button className="btn-soft rounded-full px-4 py-1.5 text-sm">Failed</button>
          </div>
        </div>

        <div className="ui-panel p-10 text-center">
          <p className="text-lg font-semibold text-slate-800">No Transactions Yet</p>
          <p className="mt-1 text-sm text-slate-500">Your transaction history will appear once you start sending or receiving money.</p>
          <Link to="/transfer" className="btn-brand mt-6 inline-flex px-6 py-2.5 text-sm">
            Send Money Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default History;
