import React from 'react';

const History = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h1>
        
        {/* Filter Bar */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium whitespace-nowrap">
            All
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            Sent
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            Received
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            Failed
          </button>
        </div>

        {/* History List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-8 text-center text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Your transaction history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
