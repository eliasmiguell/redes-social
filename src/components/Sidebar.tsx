import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { FaFacebookMessenger } from 'react-icons/fa6';
import { FaUserFriends, FaBell } from 'react-icons/fa';
import { INotification } from '@/interface';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import Image from 'next/image';

function Sidebar() {
  const { user } = useContext(UserContext);
  const [id, setId] = useState(0);

  useEffect(() => {
    const userId = user?.id;
    return setId(Number(userId));
  }, [user?.id]);

  const GetNotification = useQuery<INotification[] | undefined>({
    queryKey: ['notification', user?.id],
    queryFn: () =>
      makeRequest.get(`/notifications/?id_user=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });

  // Agrupar notificações por `sender_id` e contar o total de mensagens
  const groupedNotifications = GetNotification.data?.reduce(
    (acc, notification) => {
      if (!acc[notification.sender_id]) {
        acc[notification.sender_id] = {
          sender_id: notification.sender_id,
          username: notification.username,
          userimg: notification.userimg,
          messagesCount: 0,
        };
      }
      acc[notification.sender_id].messagesCount += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        sender_id: number;
        username: string;
        userimg: string | null;
        messagesCount: number;
      }
    >
  );

  // Convertendo o objeto agrupado em lista
  const groupedList = groupedNotifications ? Object.values(groupedNotifications) : [];

  // Contabilizando o total de mensagens não lidas
  const totalUnreadMessages = groupedList.reduce((total, notific) => total + notific.messagesCount, 0);
  
  if (GetNotification.error) {
    console.log(GetNotification.error);
  }

  return (
    <aside className="fixed w-64 h-full bg-white border-r border-gray-200 hidden lg:block">
      <nav className="p-6">
        {/* Perfil do usuário */}
        <div className="mb-8">
          <Link 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" 
            href={`/profile?id=${id}`}
          >
            <Image
              src={user?.userimg ? user?.userimg : 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
              alt="Imagem do perfil"
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
              quality={100} 
              unoptimized={true}
            />
            <div>
              <span className="font-semibold text-gray-800">{user?.username}</span>
              <p className="text-sm text-gray-500">Ver perfil</p>
            </div>
          </Link>
        </div>

        {/* Menu de navegação */}
        <div className="space-y-2">
          <Link 
            href="/followed" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
          >
            <FaUserFriends className="w-5 h-5" />
            <span className="font-medium">Seguidores</span>
          </Link>

          <Link 
            href="/messagens" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600 relative"
          >
            <FaFacebookMessenger className="w-5 h-5" />
            <span className="font-medium">Mensagens</span>
            {totalUnreadMessages > 0 && (
              <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalUnreadMessages}
              </span>
            )}
          </Link>

          <Link 
            href="/notifications" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
          >
            <FaBell className="w-5 h-5" />
            <span className="font-medium">Notificações</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
