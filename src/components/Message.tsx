'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IMessage, IUser } from '@/interface';
import { makeRequest } from '../../axios';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { FaTimesCircle, FaComments } from 'react-icons/fa';
import { FaCheckDouble } from "react-icons/fa6";
import { BsThreeDots } from 'react-icons/bs';
import Image from 'next/image';
import { FaCheck } from "react-icons/fa";
import moment from 'moment';
import 'moment/locale/pt-br';
import { io as socketIOClient } from 'socket.io-client';

// Configurar moment para português brasileiro
moment.locale('pt-br');

function Message() {
  const { user } = useContext(UserContext);
  const [idUserConversa, setIdUserConversa] = useState<IUser | undefined>(undefined);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [textMessage, setTextMessage] = useState('');
  const searchParams = useSearchParams();
  const userId = searchParams.get('conversationsId');
  const id = userId && !isNaN(parseInt(userId)) ? parseInt(userId) : user?.id;
  const queryClient = useQueryClient();

  const userConversaQuery = useQuery({
    queryKey: ['users', id],
    queryFn: async () =>
      await makeRequest
        .get(`/conversation/userConversation/?currentUserId=${id}&idUser=${user?.id}`)
        .then((res) => {
          return res.data;
        }),
    enabled: !!id && !!user?.id,
  });

  useEffect(() => {
    if (userConversaQuery.data && userConversaQuery.data.length > 0) {
      const res = userConversaQuery.data[0];
      setIdUserConversa({ username: res.username, userimg: res.userimg, id: res.id });
    }
  }, [userConversaQuery.data]);

  const messgeQuery = useQuery({
    queryKey: ['message', id],
    queryFn: async () =>
      await makeRequest
        .get(`/messagens/get-messagens?conversationsId=${id}`)
        .then((res) => {
          return res.data.data;
        }),
    enabled: !!id,
  });

  const mutationMessage = useMutation({
    mutationFn: async (newMessage: { conversations: number, sender_id: number, messages: string, recipient_id:number }) =>
      await makeRequest
        .post('/messagens', { 
          conversations: newMessage.conversations, 
          sender_id: newMessage.sender_id, 
          messages: newMessage.messages,
           recipient_id:newMessage.recipient_id })
        .then((res) => {
          return res.data.data;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      setTextMessage('');
    },
    onError: (error) => {
      console.log('Erro na mutação:', error);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: { message_id: number }) =>
      await makeRequest
        .delete(`/messagens/delete/?message_id=${id.message_id}`)
        .then((res) => {
          return res.data;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
    },
  });

  // Marcar notificações de mensagem como lidas quando abrir a conversa
  const markMessageNotificationsAsRead = useMutation({
    mutationFn: async () => {
      // Marcar notificações de mensagem como lidas para esta conversa específica
      await makeRequest.patch('/notifications/mark-message-read', { 
        user_id: user?.id,
        conversation_id: id 
      });
      return true;
    },
    onSuccess: () => {
      // Invalidar queries de notificação para atualizar os contadores
      queryClient.invalidateQueries({ queryKey: ['notification', user?.id] });
    },
  });

  const handleMenuToggle = (userId: number) => {
    if (selectedUserId === userId) {
      setShowMenu(!showMenu);
    } else {
      setSelectedUserId(userId);
      setShowMenu(true);
    }
    return true;
  };

  const markAllMessagesAsReadMutation = useMutation({
    mutationFn: async (data: { conversation_id: number; user_id: number }) => {
      try {
        const response = await makeRequest
          .patch(`/messagens/update?conversation_id=${data.conversation_id}&user_id=${data.user_id}`);
        return response.data;
      } catch (error) {
        // Se for um erro de rede, não falha a mutação
        const errorMessage = String(error);
        if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_NETWORK')) {
          console.log('Erro de rede detectado, tentando novamente...');
          return null; // Retorna null para não falhar a mutação
        }
        throw error; // Re-throw outros erros
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['messages', id] });
      }
    },
    onError: (error) => {
      console.error('Erro ao marcar mensagens como lidas:', error);
      // Log simples para debug
      console.log('Tentando novamente em breve...');
    },
  });
  
  useEffect(() => {
    if (id && user?.id && !markAllMessagesAsReadMutation.isPending && messgeQuery.data) {
      // Verifica se há mensagens não lidas antes de fazer a requisição
      const hasUnreadMessages = messgeQuery.data.some(
        (message: IMessage) => message.recipient_id === user?.id && !message.is_read
      );
      
      if (hasUnreadMessages) {
        // Debounce para evitar múltiplas requisições
        const timeoutId = setTimeout(() => {
          markAllMessagesAsReadMutation.mutate({
            conversation_id: Number(id),
            user_id: Number(user?.id),
          });
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [id, user?.id, messgeQuery.data]);

  const querMessages = useQuery({
    queryKey: ['messages', id],
    queryFn: async () =>
      await makeRequest.get(`/messagens/get-messagens?conversationsId=${id}`).then((res) =>{return res.data.data} ),
    enabled: !!id,
  });

  if (deleteMessageMutation.error) {
    console.log(deleteMessageMutation.error);
  }
  if (messgeQuery.error) {
    console.log(messgeQuery.error);
  }
  if (userConversaQuery.error) {
    console.log(userConversaQuery.error);
  }

  // Marcar notificações como lidas quando a conversa for carregada
  useEffect(() => {
    if (id && user?.id && messgeQuery.data && messgeQuery.data.length > 0) {
      // Marcar notificações de mensagem como lidas
      markMessageNotificationsAsRead.mutate();
    }
  }, [id, user?.id, messgeQuery.data]);

  // Conectar ao socket.io e registrar usuário
  useEffect(() => {
    if (!user?.id) return;
    const socketInstance = socketIOClient(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api-redes-sociais.onrender.com', {
      withCredentials: true
    });
    socketInstance.emit('registrar_usuario', user.id);
    // Receber nova mensagem em tempo real
    socketInstance.on('nova_mensagem', (msg) => {
      // Se a mensagem for para a conversa atual, atualiza a lista
      if (msg.conversationId == id) {
        queryClient.invalidateQueries({ queryKey: ['message', id] });
      }
    });
    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, id, queryClient]);

  // Verificar se a conversa é válida
  if (!id || id === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaComments className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Conversa não encontrada</h3>
          <p className="text-gray-500">Selecione uma conversa válida para começar a trocar mensagens.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header da conversa */}
      {!querMessages.isLoading && userConversaQuery.data && userConversaQuery.data.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          {userConversaQuery.data.map((res: IUser) => (
            <div key={res?.id} className="flex items-center gap-2 md:gap-3">
              <Link href={`/profile?id=${res?.id}`} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  {res?.userimg ? <Image
                    src={res?.userimg.includes('http') ? res?.userimg : `https://api-redes-sociais.onrender.com/uploads/${res?.userimg}`}
                    alt="Imagem do perfil"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    width={40}
                    height={40}
                    quality={100} 
                    unoptimized={true}
                  /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm" width={40} height={40} quality={100} unoptimized={true}/>}
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">{res?.username}</h3>
                  <p className="text-xs md:text-sm text-gray-500">Online agora</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4 bg-gray-50">
        {!querMessages.isLoading ? (
          messgeQuery.data && messgeQuery.data.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {messgeQuery.data.map((message: IMessage, index: number) => {
                const showImage = index === 0 || messgeQuery.data[index - 1]?.sender_id !== message.sender_id;
                const isUserMessage = message.sender_id === user?.id;
                
                // Formatar a hora corretamente
                const formatMessageTime = (timestamp: number) => {
                  try {
                    const messageTime = moment.unix(timestamp);
                    const now = moment();
                    
                    // Se for hoje, mostra apenas a hora
                    if (messageTime.isSame(now, 'day')) {
                      return messageTime.format('HH:mm');
                    }
                    // Se for ontem, mostra "ontem" + hora
                    else if (messageTime.isSame(now.clone().subtract(1, 'day'), 'day')) {
                      return `ontem ${messageTime.format('HH:mm')}`;
                    }
                    // Se for mais antigo, mostra a data completa
                    else {
                      return messageTime.format('DD/MM HH:mm');
                    }
                  } catch (error) {
                    console.error('Erro ao formatar hora:', error);
                    return '--:--';
                  }
                };
                
                const formattedTime = formatMessageTime(message.sent_at);
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex gap-2 md:gap-3 items-start ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar do outro usuário (esquerda) */}
                    {showImage && !isUserMessage && (
                      <div className="flex-shrink-0">
                        <Link href={`/profile?id=${idUserConversa?.id}`}>
                          {message?.userimg ? <Image
                              src={message?.userimg.includes('http') ? message?.userimg : `https://api-redes-sociais.onrender.com/uploads/${message?.userimg}`}
                            alt="Imagem do perfil"
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                            width={32}
                            height={32}
                            quality={100} 
                            unoptimized={true}
                          /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover" width={32} height={32} quality={100} unoptimized={true}/>}
                        </Link>
                      </div>
                    )}
                    
                    {/* Mensagem */}
                    <div className={`relative max-w-[70%] sm:max-w-xs lg:max-w-md ${
                      isUserMessage ? 'order-2' : 'order-1'
                    }`}>
                      <div className={`p-3 md:p-4 rounded-2xl text-sm md:text-base shadow-sm ${
                        isUserMessage 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md ml-auto' 
                          : `bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-md ${
                              !isUserMessage && !message.is_read ? 'border-blue-300 bg-blue-50' : ''
                            }`
                      }`}>
                        <p className="break-words leading-relaxed mb-2">{message?.messages}</p>
                        
                        <div className={`flex items-center justify-between text-xs ${
                          isUserMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="font-medium">{formattedTime}</span>
                          {isUserMessage && (
                            <div className="flex items-center gap-1">
                              {message.is_read ? (
                                <FaCheckDouble className="text-blue-200 text-xs" title="Lida" />
                              ) : (
                                <FaCheck className="text-blue-200 text-xs" title="Enviada" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Menu de opções (apenas para mensagens do usuário) */}
                      {isUserMessage && (
                        <div className="absolute top-1 right-1">
                          <button
                            onClick={() => handleMenuToggle(message.id)}
                            className="p-1 rounded-full hover:bg-black/10 transition-colors"
                          >
                            <BsThreeDots className="text-xs text-white" />
                          </button>
                          
                          {showMenu && selectedUserId === message.id && (
                            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 min-w-[120px]">
                              <button
                                onClick={() => deleteMessageMutation.mutate({ message_id: message.id })}
                                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm w-full"
                              >
                                <FaTimesCircle className="text-xs" />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar do usuário logado (direita) */}
                    {showImage && isUserMessage && (
                      <div className="flex-shrink-0">
                        <Link href={`/profile?id=${user?.id}`}>
                          {message?.userimg ? <Image
                            src={message?.userimg.includes('http') ? message?.userimg : `https://api-redes-sociais.onrender.com/uploads/${message?.userimg}`}
                            alt="Imagem do perfil"
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                            width={32}
                            height={32}
                            quality={100} 
                            unoptimized={true}
                          /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover" width={32} height={32} quality={100} unoptimized={true}/>}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Nenhuma conversa selecionada</h3>
                <p className="text-sm md:text-base text-gray-500">Selecione uma conversa para começar a trocar mensagens</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-500">Carregando mensagens...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input de mensagem */}
      {!querMessages.isLoading && id && idUserConversa && (
        <div className="bg-white border-t border-gray-200 px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1 relative">
              <input
                onChange={(e) => setTextMessage(e.target.value)}
                value={textMessage}
                placeholder="Digite sua mensagem..."
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && textMessage.trim()) {
                    if (user) {
                      mutationMessage.mutate({ 
                        conversations: Number(id), 
                        sender_id: user?.id, 
                        messages: textMessage, 
                        recipient_id: Number(idUserConversa?.id) 
                      });
                    }
                  }
                }}
              />
              <button 
                onClick={() => user && mutationMessage.mutate({ 
                  conversations: Number(id), 
                  sender_id: user?.id, 
                  messages: textMessage, 
                  recipient_id: Number(idUserConversa?.id) 
                })}
                disabled={!textMessage.trim()}
                className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-1.5 md:p-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;

