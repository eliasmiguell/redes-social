"use client"; 
import { ReactNode, useEffect} from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';


import { makeRequest } from '../../../axios';

export default function MainHome({children}:{children:ReactNode}) {
  const router = useRouter();

  const { data, error, isSuccess, isError } = useQuery({
    queryKey: ["refresh"],
    queryFn: async () =>
      await makeRequest.get("auth/refresh").then((res) => {
        return res.data;
      }),
    retry: false,
    refetchInterval: 60 * 50 * 1000,
  });

  if (isSuccess) {
    console.log(data.message);
  }

  useEffect(() => {
    if (isError) {
      console.log(error);
      router.push("/login");
    }
  }, [isError, error, router]);
 

  return (
    <div className="flex items-center flex-col justify-items-center bg-zinc-100 min-h-screen">
      <Header />
      <div className="w-full flex justify-start py-20">
        <Sidebar />
        <div className="w-full flex justify-center">
        {children}
        </div>
      </div>
    </div>
  );
}
