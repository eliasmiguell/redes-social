'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import Image from 'next/image';
import { IFriendship } from '@/interface';
import { FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/pt-br';

function PendingRequests() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  const pendingRequestsQuery = useQuery<IFriendship[] | undefined>({
    queryKey: ['pending-requests', user?.id],
    queryFn: () => makeRequest.get(`/friendship/pending?followed_id=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });

  const acceptMutation = useMutation({
    mutationFn: async (request: { follower_id: number; followed_id: number }) => {
      return await makeRequest.patch('/friendship/accept', request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendship', user?.id] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (request: { follower_id: number; followed_id: number }) => {
      return await makeRequest.patch('/friendship/reject', request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests', user?.id] });
    },
  });

  const handleAccept = (follower_id: number) => {
    acceptMutation.mutate({ follower_id, followed_id: Number(user?.id) });
  };

  const handleReject = (follower_id: number) => {
    rejectMutation.mutate({ follower_id, followed_id: Number(user?.id) });
  };

  if (pendingRequestsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pendingRequestsQuery.error) {
    console.log(pendingRequestsQuery.error);
  }

  const pendingRequests = pendingRequestsQuery.data || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FaUserPlus className="text-blue-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Solicitações Pendentes</h2>
          <p className="text-sm text-gray-600">Gerencie quem quer seguir você</p>
        </div>
        {pendingRequests.length > 0 && (
          <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
            {pendingRequests.length}
          </span>
        )}
      </div>

      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Image
                  src={request.userimg ? 
                    (request.userimg.includes('http') ? request.userimg : `https://api-redes-sociais.onrender.com/uploads/${request.userimg}`) :
                    "https://img.freepik.com/free-icon/user_318-159711.jpg"
                  }
                  alt="Imagem do perfil"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  width={48}
                  height={48}
                  quality={100}
                  unoptimized={true}
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{request.username}</h3>
                  <p className="text-sm text-gray-500">
                    Enviou solicitação {moment(request.created_at).fromNow()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.follower_id)}
                  disabled={acceptMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaCheck className="text-sm" />
                  Aceitar
                </button>
                <button
                  onClick={() => handleReject(request.follower_id)}
                  disabled={rejectMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <FaTimes className="text-sm" />
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserPlus className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma solicitação pendente</h3>
          <p className="text-gray-500">Você não tem solicitações de amizade no momento!</p>
        </div>
      )}
    </div>
  );
}

export default PendingRequests; 