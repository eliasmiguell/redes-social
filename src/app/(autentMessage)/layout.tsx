"use client"; 
import Header from '@/components/Header';
import ListConversations from '@/components/ListConvesations';


import { ReactNode } from 'react';


export default function MainMessage({children}:{children:ReactNode}) {

  
 return (
  <div className="flex items-center flex-col items-center bg-zinc-100 min-h-full">
    <Header />
    <div className="w-full flex justify-start ">
      <span >
      <ListConversations/>
      </span>
      
      <div className="w-full flex justify-center">
      {children}
    </div>
    </div>
  </div>
);
 
}