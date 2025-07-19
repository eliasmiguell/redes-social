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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      <div className="flex pt-16 h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 h-full overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
