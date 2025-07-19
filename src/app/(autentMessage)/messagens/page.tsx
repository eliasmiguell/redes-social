'use client'

import Message from '@/components/Message';
import { Suspense } from 'react';

function MessagePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Message/>
    </Suspense>
  );
}

export default MessagePage;






     
       
         

          
            

