'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { makeRequest } from '../../axios';
import { useContext, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { IChat, INotification } from '@/interface';
import { BsThreeDots } from "react-icons/bs";

function ListConversations() {

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
    queryFn: () => makeRequest.get(`/notifications/?id_user=${user?.id}`).then((res) =>{return res.data.data} ),
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
 
  if (error) {
    console.log(error);
  }

   if (GetNotification.error) {
    console.log(GetNotification.error);
  }

  if (deleteMutation.error) {
    console.log(error);
  }
  return (
    <>    
    <aside className='fixed w-1/4 sm:w-1/4 pl-4 py-20 '>
      <div className="my-4">
        <span className="font-semibold border-b  text-2xl whitespace-nowrap">Chat</span>
      </div>
      <nav className={`flex flex-col gap-1 text-gray-600 font-seminold`}>
        {data?.map((users: IChat) => (
          <div key={users?.id} className="flex gap-1 relative lg:flex-row items-center justify-between my-4">
            <Link className="flex gap-1 items-center w-3/6" href={`/messagens/?conversationsId=${users?.id}`}>
              <Image 
                src={users?.other_userimg || "https://img.freepik.com/free-icon/user_318-159711.jpg"}
                alt="Imagem do perfil"
                className="w-25 h-25 sm:w-8 sm:h-8 rounded-full object-cover"
                width={32}
                height={32}
                quality={100} 
                unoptimized={true}
              />
              <span className="font-bold text-x hidden md:block">{users?.other_username}</span>
              <span className='bg-zinc-100 ml-3 pb-2 hidden md:block' onClick={() => handleMenuToggle(users?.id)}>
                <BsThreeDots />
              </span>
              {showMenu && selectedUserId === users.id && (
                <div className='absolute flex-col  bg-white p-1 mb-10 shadow-md left-[150px] rounded-md border-t whitespace-nowrap'
                  onMouseLeave={() => setShowMenu(false)}>
                  <Link href='' onClick={() => deleteMutation.mutate({ conversation_id: users.id })}>
                    Excluir conversa
                  </Link>
                </div>
               
              )}
            </Link>
          </div>
        ))}
      </nav>
    </aside>
    {/* {groupedList.map((notific) => (
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
    ))} */}
    </>
  );
}

export default ListConversations;
