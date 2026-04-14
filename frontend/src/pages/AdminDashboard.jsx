import React from 'react';
import { useUser } from '../context/UserContext';

const AdminDashboard = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-gray-900 text-white flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">UPI Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-4">
          <a href="#" className="block px-4 py-2 rounded bg-blue-600 text-white font-medium">
            Overview
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300">
            Audit Log
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300">
            User Activity
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300">
            Settings
          </a>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Admin: {user?.firstName}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-6">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="md:hidden px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Users</p>
              <h2 className="text-3xl font-bold text-gray-800">0</h2>
              <p className="text-gray-400 text-xs mt-2">Counting...</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Transaction Volume</p>
              <h2 className="text-3xl font-bold text-gray-800">₹ 0</h2>
              <p className="text-gray-400 text-xs mt-2">Calculating...</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Failed Attempts</p>
              <h2 className="text-3xl font-bold text-gray-800">0</h2>
              <p className="text-gray-400 text-xs mt-2">Monitoring...</p>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Audit Log</h2>
              <p className="text-gray-600 text-sm mt-1">Live transaction audit trail</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Log ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Old Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">New Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No audit logs yet. Systems will automatically log transactions.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* User Activity Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">User Activity</h2>
              <p className="text-gray-600 text-sm mt-1">Recent user activities and last active times</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">VPA</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No user data yet. Users will appear here as they register.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
