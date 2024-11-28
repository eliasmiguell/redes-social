"use client"; 

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css' ;
import { ToastContainer } from 'react-toastify';
import { UserContextProvider } from '@/context/UserContext';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient()); 

  return (
    <html lang="pt-br">
      <body>
        <QueryClientProvider client={queryClient}>
        <UserContextProvider>{children}</UserContextProvider>
        <ToastContainer/>
        </QueryClientProvider>
      </body>
    </html>
  );
}
