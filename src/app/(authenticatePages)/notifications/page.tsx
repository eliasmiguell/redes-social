'use client';

import Notification from '@/components/Notifications';
import { Suspense } from 'react';

function NotificationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <Notification />
        </div>
      </div>
    </Suspense>
  );
}

export default NotificationPage;