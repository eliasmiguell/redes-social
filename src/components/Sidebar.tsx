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
    <aside className={`fixed w-1/6 sm:w-1/4 lg:w-1/6 pl-4 hidden sm:block`}>
      <nav className="flex flex-col gap-6 text-gray600 font-seminold">
        <Link className="flex gap-2 pb-6 itemns-center" href={`/profile?id=${id}`}>
          <Image
            src={user?.userimg ? user?.userimg : 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
            alt="Imagem do perfil"
            className="w-8 h-8 rounded-full"
            width={32}
            height={32}
            quality={100} 
            unoptimized={true}
          />
          <span className="font-semibold">{user?.username}</span>
        </Link>
        <Link href="/followed" className="flex gap-3 itemns-center">
          <FaUserFriends className="w-6 h-6" />
          Seguidores
        </Link>

        {/* Ícone de Mensagens */}
        <Link href="/messagens" className="flex gap-3 itemns-center relative">
          <FaFacebookMessenger className="w-6 h-6" />
          Mensagens
          {totalUnreadMessages > 0 && (
            <span className="absolute top-0 right-[80px] bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnreadMessages}
            </span>
          )}
        </Link>

        {/* Ícone de Notificações */}
        <Link href="/notifications" className="flex gap-3 itemns-center relative">
          <FaBell className="w-6 h-6" />
          Notificações
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
