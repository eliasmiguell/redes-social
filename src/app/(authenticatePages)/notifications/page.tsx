'use client';

import Notifications from '@/components/Notifications';
import PendingRequests from '@/components/PendingRequests';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PendingRequests />
      <Notifications />
    </div>
  );
}