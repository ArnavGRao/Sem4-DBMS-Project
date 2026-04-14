import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-gray-200 rounded-2xl p-5 shadow-lg animate-pulse h-24"></div>
);

export const SkeletonText = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`bg-gray-200 rounded ${width} ${height} animate-pulse`}></div>
);

export const SkeletonButton = () => (
  <div className="bg-gray-200 rounded-lg h-10 animate-pulse"></div>
);

export const BalanceCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-200 to-gray-300 text-transparent rounded-2xl p-6 mb-6 shadow-2xl animate-pulse">
    <div className="flex justify-between items-start mb-12">
      <div>
        <div className="h-4 bg-gray-300 w-32 rounded mb-3"></div>
        <div className="h-12 bg-gray-300 w-48 rounded"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-300 w-full rounded-lg"></div>
  </div>
);

export const AccountListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 relative overflow-hidden">
    <div className="max-w-md w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 w-48 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 w-32 rounded animate-pulse"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Balance Card */}
      <BalanceCardSkeleton />

      {/* Quick Actions */}
      <SkeletonCard />

      {/* Accounts Section */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
        <div className="h-6 bg-gray-200 w-40 rounded mb-4 animate-pulse"></div>
        <AccountListSkeleton />
      </div>
    </div>
  </div>
);

export default {
  SkeletonCard,
  SkeletonText,
  SkeletonButton,
  BalanceCardSkeleton,
  AccountListSkeleton,
  DashboardSkeleton,
};
