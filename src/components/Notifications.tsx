'use client';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { INotification } from '@/interface';
import { FaBell, FaComments, FaEye } from 'react-icons/fa';

function Notification() {
  const { user } = useContext(UserContext);

  const GetNotification = useQuery<INotification[] | undefined>({
    queryKey: ['notification', user?.id],
    queryFn: () => makeRequest.get(`/notifications/?id_user=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });

  // Agrupar mensagens por `sender_id` e armazenar `conversation_id`
  const groupedNotifications = GetNotification.data?.reduce((acc, notification) => {
    if (!acc[notification.sender_id]) {
      acc[notification.sender_id] = {
        sender_id: notification.sender_id,
        username: notification.username,
        userimg: notification.userimg,
        conversations: new Set<number>(),
        messagesCount: 0,
      };
    }

    // Adicionar o `conversation_id` apenas se ainda não estiver na lista
    acc[notification.sender_id].conversations.add(notification.conversations)
    acc[notification.sender_id].messagesCount += 1;

    return acc;
  }, {} as Record<
    string,
    {
      sender_id: number;
      username: string;
      userimg: string | null;
      conversations: Set<number>;
      messagesCount: number;
    }
  >) || {};

  const groupedList = Object.values(groupedNotifications).map((group)=>({
    ...group,
    conversations:Array.from(group.conversations)
  }));

  if (GetNotification.error) {
    console.log(GetNotification.error);
  }

  if (GetNotification.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <FaBell className="text-white text-lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
        </div>
        <p className="text-gray-600">Mantenha-se atualizado com as atividades dos seus amigos</p>
      </div>

      {/* Mensagens não lidas */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FaComments className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Mensagens não lidas</h2>
          {groupedList.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {groupedList.length}
            </span>
          )}
        </div>

        {groupedList.length > 0 ? (
          <div className="space-y-3">
            {groupedList.map((notific) => (
              <Link 
                href={`/messagens/?conversationsId=${notific.conversations.join(',')}`} 
                key={notific.sender_id} 
                className="block"
              >
                <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="relative">
                    {notific.userimg ? <Image 
                      src={notific.userimg.includes('http') ? notific.userimg : `https://api-redes-sociais.onrender.com/uploads/${notific.userimg}`}
                      alt="Imagem do perfil"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      width={48}
                      height={48}
                      quality={100} 
                      unoptimized={true}
                    /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" width={48} height={48} quality={100} unoptimized={true}/>}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{notific.messagesCount}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{notific.username}</h3>
                      <span className="text-xs text-gray-500">Agora</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notific.messagesCount} nova{notific.messagesCount > 1 ? 's' : ''} mensagem{notific.messagesCount > 1 ? 'ns' : ''}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaComments className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma mensagem não lida</h3>
            <p className="text-gray-500">Você está em dia com todas as suas conversas!</p>
          </div>
        )}
      </div>

      {/* Posts não vistos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FaEye className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Posts não vistos</h2>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaEye className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum post não visto</h3>
          <p className="text-gray-500">Você visualizou todos os posts dos seus amigos!</p>
        </div>
      </div>
    </div>
  );
}

export default Notification;
