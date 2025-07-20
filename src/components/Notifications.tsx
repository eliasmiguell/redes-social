'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { INotification } from '@/interface';
import { FaBell, FaUserPlus, FaHeart, FaComment } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/pt-br';

function Notification() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  const GetNotification = useQuery<INotification[] | undefined>({
    queryKey: ['notification', user?.id],
    queryFn: () => makeRequest.get(`/notifications/?user_id=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notification_id: number) => {
      return await makeRequest.patch('/notifications/mark-read', { notification_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await makeRequest.patch('/notifications/mark-all-read', { user_id: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', user?.id] });
    },
  });

  const handleMarkAsRead = (notification_id: number) => {
    markAsReadMutation.mutate(notification_id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <FaUserPlus className="text-blue-600" />;
      case 'follow_request':
        return <FaUserPlus className="text-orange-600" />;
      case 'follow_accepted':
        return <FaUserPlus className="text-green-600" />;
      case 'like':
        return <FaHeart className="text-red-600" />;
      case 'comment':
        return <FaComment className="text-green-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };

  const getNotificationLink = (notification: INotification) => {
    switch (notification.notification_type) {
      case 'follow':
        return `/profile?id=${notification.from_user_id}`;
      case 'like':
      case 'comment':
        return notification.reference_id ? `/main?post=${notification.reference_id}` : '/main';
      default:
        return '/main';
    }
  };

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

  const unreadNotifications = GetNotification.data?.filter(n => !n.is_read) || [];
  const allNotifications = GetNotification.data || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <FaBell className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
          </div>
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <p className="text-gray-600">Mantenha-se atualizado com as atividades dos seus amigos</p>
      </div>

      {/* Notificações não lidas */}
      {unreadNotifications.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaBell className="text-red-600" />
            <h2 className="text-xl font-semibold text-gray-800">Não lidas</h2>
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {unreadNotifications.length}
            </span>
          </div>

          <div className="space-y-3">
            {unreadNotifications.map((notification) => (
              <Link 
                href={getNotificationLink(notification)}
                key={notification.id} 
                className="block"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                  <div className="relative">
                    <Image 
                      src={notification.from_userimg ? 
                        (notification.from_userimg.includes('http') ? notification.from_userimg : `https://api-redes-sociais.onrender.com/uploads/${notification.from_userimg}`) :
                        "https://img.freepik.com/free-icon/user_318-159711.jpg"
                      }
                      alt="Imagem do perfil"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      width={48}
                      height={48}   
                      quality={100} 
                      unoptimized={true}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{notification.from_username}</h3>
                      <span className="text-xs text-gray-500">{moment(notification.created_at).fromNow()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  
                  <div className="ml-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>  
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Todas as notificações */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FaBell className="text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Todas as notificações</h2>
        </div>

        {allNotifications.length > 0 ? (
          <div className="space-y-3">
            {allNotifications.map((notification) => (
              <Link 
                href={getNotificationLink(notification)}
                key={notification.id} 
                className="block"
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <div className={`flex items-center p-4 rounded-xl hover:bg-gray-100 transition-colors border ${
                  notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="relative">
                    <Image 
                      src={notification.from_userimg ? 
                        (notification.from_userimg.includes('http') ? notification.from_userimg : `https://api-redes-sociais.onrender.com/uploads/${notification.from_userimg}`) :
                        "https://img.freepik.com/free-icon/user_318-159711.jpg"
                      }
                      alt="Imagem do perfil"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      width={48}
                      height={48}   
                      quality={100} 
                      unoptimized={true}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{notification.from_username}</h3>
                      <span className="text-xs text-gray-500">{moment(notification.created_at).fromNow()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  
                  {!notification.is_read && (
                    <div className="ml-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-500">Você não tem notificações no momento!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;
