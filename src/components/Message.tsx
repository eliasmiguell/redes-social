'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IMessage, IUser } from '@/interface';
import { makeRequest } from '../../axios';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { FaTimesCircle } from 'react-icons/fa';
import { FaCheckDouble } from "react-icons/fa6";
import { BsThreeDots } from 'react-icons/bs';
import Image from 'next/image';
import { FaCheck } from "react-icons/fa";
import moment from 'moment';
import 'moment/locale/pt-br';

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
    { userConversaQuery.data?.map((res: IUser) => {
      setIdUserConversa({ username: res.username, userimg: res.userimg, id: res.id });
    }) }
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
      console.error('Erro na mutação:', error);
    },
  });
//delete mensagem
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: { message_id: number }) =>
      await makeRequest
        .delete(`messagens/delete/?message_id=${id.message_id}`)
        .then((res) => {
          return res.data;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
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

  //visualizar mesnagem

  const markAllMessagesAsReadMutation = useMutation({
    mutationFn: async (data: { conversation_id: number; user_id: number }) => {
     
      return await makeRequest
        .patch(`/messagens/update?conversation_id=${data.conversation_id}&user_id=${data.user_id}`)
        .then((res) =>{return res.data});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
    onError: (error) => {
      console.error('Erro ao marcar mensagens como lidas:', error);
    },
  });
  
  useEffect(() => {
    if (id && user?.id) {
      markAllMessagesAsReadMutation.mutate({
        conversation_id: Number(id),
        user_id: Number(user?.id),
      });
    }
  }, [id, user?.id]);
  


  const querMessages = useQuery({
    queryKey: ['messages', id],
    queryFn: async () =>
      await makeRequest.get(`/messagens?conversationId=${id}`).then((res) =>{return res.data.data} ),
    enabled: !!id,
  });
  if (deleteMessageMutation.error) {
    console.log(deleteMessageMutation.error);
  }
  if (messgeQuery.error) {
    console.log(messgeQuery.error);
  }
  if (messgeQuery.isLoading) {
    return <div>Carregando mensagens...</div>;
  }
  if (userConversaQuery.error) {
    console.log(userConversaQuery.error);
  }
  
  return (
    <>
      <div className="bg-zinc-200 relative flex flex-col  w-full h-full rounded-lg mt-[50px] lg:mt-[75px]">
        <div>
          { !querMessages.isLoading && userConversaQuery.data?.map((res: IUser) => {
            return (
              <header className="absolute fixed x-10 rounded-md px-4 w-full bg-zinc-100 text-gray-600 font-seminold border-b border-white" key={res?.id}>
                <div className="flex py-4" >
                  <Link className="flex flex-row gap-3 items-center" href={`/profile?id=${res?.id}`}>
                    <Image
                      src={res?.userimg ? res?.userimg : 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
                      alt="Imagem do perfil"
                      className="w-8 h-8 rounded-full object-cover"
                      width={32}
                      height={32}
                      quality={100} 
                      unoptimized={true}
                    />
                    <span></span>
                    <span className="font-bold text-x  ">{res?.username}</span>
                  </Link>
                </div>
              </header>
            );
          })}
        </div>

        <div className="absolute w-full h-[76.5vh] top-[70px] px-2 py-4 rounded-md bg-zinc-200 flex flex-col overflow-auto">

          {!querMessages.isLoading? messgeQuery.data?.map((message: IMessage, index: number) => {
            const showImage = index === 0 || messgeQuery.data[index - 1]?.sender_id !== message.sender_id;
            const isUserMessage = message.sender_id === user?.id;
            return (
              <div  className={` pb-5 flex gap-3 items-center my-2 ${isUserMessage ? 'ml-auto' : 'mr-auto'}`} key={message.id}>
                {showImage && (
                  <Link href={isUserMessage ? `/profile?id=${user?.id}` : `/profile?id=${idUserConversa?.id}`}>
                    <Image
                      src={message?.userimg || 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
                      alt="Imagem do perfil"
                      className="w-8 h-8 rounded-full object-cover"
                      width={32}
                       height={32}
                       quality={100} 
                        unoptimized={true}
                    />
                  </Link>
                )}
                <div className={`flex relative p-2 rounded-lg text-sm ${isUserMessage ? 'bg-[#0032c3] text-white' : 'bg-gray-100'}`}>
                  {message?.messages}
                  <div className="flex flex-col justify-center items-center">
                    <span
                      className={`${isUserMessage ? 'bg-[#0032c3] text-white' : 'bg-gray-100'}`}
                      onClick={() => handleMenuToggle(message.id)}
                    >
                      <BsThreeDots />
                    </span>
                    <span className="text-[10px]">{moment(message.sent_at).fromNow()}</span>
                    <span className={message.is_read ? 'text-blue-400' : 'text-gray-400'} >
                      {message.is_read ? < FaCheckDouble className='text-[10px]' />  :<FaCheck className='text-[10px]' /> }
                      </span>
                  </div>
                  {showMenu && selectedUserId === message.id && (
                    <div
                      className={`absolute flex-col bg-white p-1 mb-10 shadow-md ${isUserMessage ? 'right-0' : ' right-[0px]'} right-0 rounded-md border-t whitespace-nowrap`}
                      onMouseLeave={() => setShowMenu(false)}
                    >
                      <button>
                        <FaTimesCircle
                          className="text-red-600"
                          onClick={() => deleteMessageMutation.mutate({ message_id: message.id })}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }): <span>Carregando messagem...</span>}
        </div>

        
          {!querMessages.isLoading && (
            <div className="w-full bg-zinc-100 flex items-center  mt-4 text-gray-600 px-3 py-5 rounded-md top-[83vh] sm:top-[80vh] absolute">
            <input
            onChange={(e) => setTextMessage(e.target.value)}
            id={`coment `}
            value={textMessage}
            placeholder="Messagem..."
            type="text"
            className="bg-zinc-100 w-full focus-visible:outline-none"
          />
          <button onClick={() => user && mutationMessage.mutate({ conversations: Number(id), sender_id: user?.id, messages: textMessage, recipient_id: Number(idUserConversa?.id)  })}>
            Enviar
          </button>
          </div>
          )}
        
      </div>
    </>
  );
}

export default Message;

