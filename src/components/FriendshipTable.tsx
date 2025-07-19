'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import Image from 'next/image';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import { IFriendship } from '@/interface';
import { FaUserFriends } from 'react-icons/fa';


function FriendshipTable() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  // Pega os amigos
  const GetFriends = useQuery<IFriendship[] | undefined>({
    queryKey: ['friendship', user?.id],
    queryFn: () => makeRequest.get(`friendship/?follower_id=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });


  // Mutação para parar de seguir
  const mutation = useMutation({
    mutationFn: async (paraDeSeguir: { follower_id: number; followed_id: number }) =>
      await makeRequest
        .delete(`/friendship/?follower_id=${paraDeSeguir.follower_id}&followed_id=${paraDeSeguir.followed_id}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendship', user?.id] });
    },
  });

  if (!user || !user.id) {
    return <div>Loading...</div>;
  }
  if (GetFriends.error) {
    console.log(GetFriends.error);
  }
  return (
    <div className="w-full">
      {/* Estatísticas */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Seguindo</p>
                <p className="text-2xl font-bold text-blue-800">{GetFriends.data?.length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaUserFriends className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de seguidores */}
      <div className="space-y-4">
        {GetFriends.data && GetFriends.data.length > 0 ? (
          GetFriends.data.map((friendship: IFriendship) => (
            <div 
              key={friendship.id} 
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <Link 
                  className="flex items-center gap-4 flex-1" 
                  href={`/profile?id=${friendship.followed_id}`}
                >
                  <div className="relative">
                    <Image
                      src={friendship?.userimg ? friendship?.userimg : 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
                      alt="Imagem do perfil"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      quality={100} 
                      unoptimized={true}
                      width={48}
                      height={48}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{friendship?.username}</h3>
                    <p className="text-sm text-gray-500">Seguindo desde agora</p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center gap-2"
                    onClick={() =>
                      mutation.mutate({
                        followed_id: friendship.followed_id,
                        follower_id: user.id,
                      })
                    }
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Deixar de seguir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserFriends className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum seguidor encontrado</h3>
            <p className="text-gray-500 mb-6">Você ainda não está seguindo ninguém. Que tal começar a conectar-se com outros usuários?</p>
            <Link 
              href="/search" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Descobrir pessoas
            </Link>
          </div>
        )}
      </div>

      {/* Loading state */}
      {GetFriends.isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando seus seguidores...</p>
        </div>
      )}
    </div>
  );
}

export default FriendshipTable;
