'use client'

import Message from '@/components/Message';
import { Suspense } from 'react';

function MessagePage() {
 
    return(
      <Suspense fallback={<div>Carregando...</div>}>
        <div className='bg-zinc-200 overflow-x-auto overflow-y-hidden w-[70vw] lg:ml-[1.5vw] ml-[15vw] lg:w-1/4 sm:w-1/4 md:w-2/4 h-[98.5vh] rounded-lg shadow-md'>
        <Message/>
        </div>
        </Suspense>
    );
  };
  
export default MessagePage;






     
       
         

          
            

