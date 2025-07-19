"use client"
import { Suspense } from 'react';
import Feed from '@/components/Feed';
import Share from '@/components/Share';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../../../axios';
import { IPost } from '@/interface';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { FaHome} from 'react-icons/fa';

function Main() {
  const { user } = useContext(UserContext);

  const postQuery = useQuery<IPost[] | undefined>({
    queryKey: ['posts'],
    queryFn: async() =>
      await makeRequest.get('post/').then((res)=>{
        return res.data.data
      }),
    enabled: !!user
  });
  
  if(postQuery.error){
    console.log(postQuery.error);
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header da página */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaHome className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Feed Principal</h1>
              <p className="text-gray-600">Compartilhe momentos e conecte-se com amigos</p>
            </div>
          </div>
          
          {/* Estatísticas rápidas */}
          
        </div>

        {/* Área de criação de post */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <Suspense fallback={
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <Share />
          </Suspense>
        </div>

        {/* Feed de posts */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Posts Recentes</h2>
          </div>
          <div className="p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <Feed post={postQuery.data} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
