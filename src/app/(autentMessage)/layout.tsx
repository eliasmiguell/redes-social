"use client"; 
import Header from '@/components/Header';
import ListConversations from '@/components/ListConvesations';
import { ReactNode } from 'react';

export default function MainMessage({children}:{children:ReactNode}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16 h-screen">
        {/* Sidebar de conversas */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <ListConversations />
        </div>
        
        {/* Área principal do chat */}
        <div className="flex-1 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}