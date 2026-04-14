import React from 'react';
import { useUser } from '../context/UserContext';

const AdminDashboard = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-shell">
      <div className="page-enter mx-auto w-full max-w-6xl">
        <header className="ui-panel mb-4 flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Admin Console</p>
            <h1 className="ui-title mt-1 text-3xl">UPI Operations Dashboard</h1>
            <p className="ui-subtle mt-1 text-sm">Welcome, {user?.firstName || 'Admin'}</p>
          </div>
          <button onClick={handleLogout} className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            Logout
          </button>
        </header>

        <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="ui-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Users</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">0</p>
            <p className="mt-1 text-sm text-slate-500">Counting...</p>
          </div>
          <div className="ui-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Transaction Volume</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">₹ 0</p>
            <p className="mt-1 text-sm text-slate-500">Calculating...</p>
          </div>
          <div className="ui-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Failed Attempts</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">0</p>
            <p className="mt-1 text-sm text-slate-500">Monitoring...</p>
          </div>
        </section>

        <section className="ui-panel mb-4 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Audit Log</h2>
            <p className="mt-1 text-sm text-slate-500">Live transaction audit trail</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Log ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Transaction ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Action</th>
                  <th className="px-5 py-3 text-left font-semibold">Old Status</th>
                  <th className="px-5 py-3 text-left font-semibold">New Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                    No audit logs yet. Systems will automatically log transactions.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="ui-panel overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-semibold text-slate-900">User Activity</h2>
            <p className="mt-1 text-sm text-slate-500">Recent user activities and last active times</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">User ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">VPA</th>
                  <th className="px-5 py-3 text-left font-semibold">Last Active</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                    No user data yet. Users will appear here as they register.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
