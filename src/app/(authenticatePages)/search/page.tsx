'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { makeRequest } from '../../../../axios';
import { IPost, IUser } from '@/interface';
import Link from 'next/link';
import Post from '@/components/Post';
import Image from 'next/image';
import { FaSearch, FaUsers, FaFileAlt, FaUser, FaSpinner } from 'react-icons/fa';
import { useState } from 'react';

function SearchPage() {
  const searchParams = useSearchParams();
  const params = searchParams.get('params');
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');

  const users = useQuery({
    queryKey: ['searchUsers', params],
    queryFn: async () =>
      await makeRequest
        .get(`search/search-users?params=${params}`)
        .then((res) => {
          return res.data.data;
        }),
    enabled: !!params,
  });

  if (users.error) {
    console.log(users.error);
  }

  const posts = useQuery({
    queryKey: ['searchPosts', params],
    queryFn: async () =>
     await  makeRequest
        .get(`/search/search-posts?params=${params}`)
        .then((res) => {
          return res.data.data;
        }),
    enabled: !!params,
  });

  if (posts.error) {
    console.log(posts.error);
  }

  const isLoading = users.isLoading || posts.isLoading;
  const hasResults = (users.data && users.data.length > 0) || (posts.data && posts.data.length > 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header da busca */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FaSearch className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Resultados da busca
            </h1>
            <p className="text-gray-600">
              {params ? `Buscando por: "${params}"` : 'Digite algo para buscar'}
            </p>
          </div>
        </div>

        {/* Tabs responsivas */}
        <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaUsers className="w-4 h-4" />
            <span className="hidden sm:inline">Usuários</span>
            <span className="sm:hidden">Pessoas</span>
            {users.data && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                {users.data.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'posts'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaFileAlt className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
            <span className="sm:hidden">Posts</span>
            {posts.data && (
              <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                {posts.data.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Buscando resultados...</p>
        </div>
      )}

      {/* No results */}
      {!isLoading && !hasResults && params && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600">
            Tente buscar por outros termos ou verifique a ortografia.
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasResults && (
        <div className="space-y-6">
          {/* Usuários */}
          {activeTab === 'users' && users.data && users.data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.data.map((user: IUser) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <Link href={`profile?id=${user?.id}`} className="block">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Image
                          src={user?.userimg || 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
                          alt="Imagem do perfil"
                          className="w-12 h-12 rounded-full object-cover"
                          width={48}
                          height={48}
                          quality={100} 
                          unoptimized={true}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {user?.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ver perfil
                        </p>
                      </div>
                      <FaUser className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Posts */}
          {activeTab === 'posts' && posts.data && posts.data.length > 0 && (
            <div className="space-y-4">
              {posts.data.map((post: IPost) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <Post post={post} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state for active tab */}
          {activeTab === 'users' && (!users.data || users.data.length === 0) && (
            <div className="text-center py-8">
              <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum usuário encontrado para esta busca.</p>
            </div>
          )}

          {activeTab === 'posts' && (!posts.data || posts.data.length === 0) && (
            <div className="text-center py-8">
              <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum post encontrado para esta busca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { Suspense } from 'react';

function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando busca...</div>}>
      <SearchPage />
    </Suspense>
  );
}

export default SearchPageWrapper;
