'use client';

import Notification from '@/components/Notifications';
import { Suspense } from 'react';

function NotificationPage() {

  return (
    <Suspense fallback={<div>Carregando...</div>}>
    <div className=" w-1/4 text-gray-600 flex items-center flex-col gap-5">
   <Notification/>
    </div>
    </Suspense>
  );
}
export default NotificationPage;