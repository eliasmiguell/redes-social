'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { makeRequest } from '../../axios';
import { useContext, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { IChat, INotification } from '@/interface';
import { BsThreeDots } from "react-icons/bs";
import { FaComments, FaTimes } from 'react-icons/fa';

interface ListConversationsProps {
  onClose?: () => void;
  isMobile?: boolean;
}

function ListConversations({ onClose, isMobile }: ListConversationsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  const { data, error } = useQuery({
    queryKey: ['chat', user?.id],
    queryFn: async () => await makeRequest.get(`/conversation/?userid=${user?.id}`)
      .then((res) => {
        return res.data.data;
      }),
    enabled: !!user?.id,
  });

  const handleMenuToggle = (userId: number) => {
    if (selectedUserId === userId) {
      setShowMenu(!showMenu);
    } else {
      setSelectedUserId(userId);
      setShowMenu(true);
    }
    return true
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: { conversation_id: number }) => await makeRequest
      .delete(`conversation/?conversation_id=${id.conversation_id}`)
      .then((res) => {
        return res.data;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', user?.id] });
    },
  });

  const GetNotification = useQuery<INotification[] | undefined>({
    queryKey: ['notification', user?.id],
    queryFn: () => makeRequest.get(`/notifications/?user_id=${user?.id}`).then((res) =>{return res.data.data} ),
    enabled: !!user?.id,
  });

  // Remover duplicatas baseado no ID da conversa e garantir keys únicas
  const uniqueConversations = data ? data
    .filter((conversation: IChat) => conversation && conversation.id) // Filtrar dados válidos
    .filter((conversation: IChat, index: number, self: IChat[]) => 
      index === self.findIndex((c: IChat) => c.id === conversation.id)
    )
    .map((conversation: IChat, index: number) => ({
      ...conversation,
      uniqueKey: `conversation-${conversation.id}-${index}` // Garantir key única
    })) : [];
 
  if (error) {
    console.log(error);
  }

  if (GetNotification.error) {
    console.log(GetNotification.error);
  }

  if (deleteMutation.error) {
    console.log(deleteMutation.error);
  }

  // Verificar se os dados são válidos
  if (!data || !Array.isArray(data)) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <FaComments className="text-white text-lg md:text-xl" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Chat</h2>
            </div>
            {isMobile && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-gray-600" />
              </button>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-500">Conecte-se com seus amigos através de mensagens privadas</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando conversas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header da lista de conversas */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <FaComments className="text-white text-lg md:text-xl" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Chat</h2>
          </div>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          )}
        </div>
        <p className="text-xs md:text-sm text-gray-500">Conecte-se com seus amigos através de mensagens privadas</p>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 md:p-4">
          <nav className="space-y-1 md:space-y-2">
            {uniqueConversations && uniqueConversations.length > 0 ? (
              uniqueConversations.map((users: IChat & { uniqueKey: string }) => (
                <div key={users.uniqueKey} className="relative">
                  <Link 
                    className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl hover:bg-gray-50 transition-colors group" 
                    href={`/messagens/?conversationsId=${users?.id}`}
                    onClick={() => isMobile && onClose && onClose()}
                  >
                    <div className="relative">
                      {users?.other_userimg ? <Image 
                            src={users?.other_userimg.includes('http') ? users?.other_userimg : `https://api-redes-sociais.onrender.com/uploads/${users?.other_userimg}`}
                        alt="Imagem do perfil"
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              width={48}
                        height={48}
                        quality={100} 
                        unoptimized={true}
                      /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm" width={48} height={48} quality={100} unoptimized={true}/>}
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 truncate text-sm md:text-base">{users?.other_username}</h3>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuToggle(users?.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 transition-all"
                        >
                          <BsThreeDots className="text-gray-500 text-sm" />
                        </button>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500">Online agora</p>
                    </div>
                  </Link>
                  
                  {showMenu && selectedUserId === users.id && (
                    <div 
                      className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 min-w-[140px]"
                      onMouseLeave={() => setShowMenu(false)}
                    >
                      <button
                        onClick={() => deleteMutation.mutate({ conversation_id: users.id })}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir conversa
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaComments className="text-gray-400 text-xl md:text-2xl" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Nenhuma conversa encontrada</h3>
                <p className="text-sm md:text-base text-gray-500 mb-4">Você só pode conversar com pessoas que você segue.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Dica:</strong> Siga algumas pessoas primeiro para poder trocar mensagens com elas!
                  </p>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default ListConversations;
