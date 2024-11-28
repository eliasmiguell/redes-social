'use client';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { INotification } from '@/interface';

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

  return (
    <>
    <div className="w-full mr-2 text-gray-600 flex items-center flex-col gap-2">
      <div className="mb-4">
        <span className="font-bold border-b text-2xl whitespace-nowrap">Mensagens não lidas</span>
      </div>
      {groupedList.map((notific) => (
        
        <Link href={`/messagens/?conversationsId=${notific.conversations.join(',')}`} key={notific.sender_id} className="flex flex-row lg:flex-row items-center justify-between my-2">
          <div className="flex items-center w-full">
            <Image 
              src={notific.userimg || 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
              alt="Imagem do perfil"
              className="w-8 h-8 rounded-full object-cover mr-2"
              width={32}
              height={32}
              quality={100} 
              unoptimized={true}
            />
            <div>
              <span className=" text-lg">{notific.username}</span>
              <br />
              <span className="font-bold text-sm">{notific.messagesCount} nova(s) mensagem(ns)</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
    <div className="w-full mt-[50px] mr-2 text-gray-600 flex items-center flex-col gap-2">
    <div className="mb-4  ">
      <span className="font-bold border-b text-2xl whitespace-nowrap">Posts não visto</span>
    </div>

  </div>
  </>
  );
}

export default Notification;
