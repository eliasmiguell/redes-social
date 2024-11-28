'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSearchParams } from 'next/navigation'; 
import Feed from '@/components/Feed';
import { useContext, useState, MouseEvent } from 'react';
import { UserContext } from '@/context/UserContext';
import { IPost, IFriendship, IConversatio, IChat } from '@/interface'; 
import { FaTimesCircle } from 'react-icons/fa';
import AuthInput from '@/components/AuthInput';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { makeRequest } from '../../axios';

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [followed, setFollowed] = useState(false);
  const [existConvers, setExistConvers] = useState(false);
  const [idexistConvers, setIdExistConvers] = useState(0);
  const [username, setUsername] = useState('');
  const [userimg, setUserimg] = useState('');
  const [bgimg, setBgimg] = useState('');
  const [editProfile, setEditProfile] = useState(false);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const id = userId && !isNaN(parseInt(userId)) ? parseInt(userId) : user?.id;
  const router = useRouter();

  if (!id) {
    return <div>Usuário não encontrado.</div>; // Evitar retornar antes de chamar os hooks
  }

  // Consulta para pegar os dados do perfil
  const profileQuery = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await makeRequest.get(`/users/get-users?id=${id}`);
      setUsername(res.data[0].username);
      setUserimg(res.data[0].userimg);
      setBgimg(res.data[0].bgimg);
      return res.data[0];
    },enabled: !! id
  });

  
 
  const postQuery = useQuery<IPost[] | undefined>({
    queryKey: ['posts', id],
    queryFn: async () => await makeRequest.get(`/post/?id=${id}`).then((res) => res.data.data),
    enabled: !!id
  });

  // Consulta para verificar se o usuário está seguindo o perfil
  const friendQuery = useQuery({
    queryKey: ['friendship', id],
    queryFn: async () => {
      const res = await makeRequest.get(`friendship/?follower_id=${user?.id}`);
      res.data.data.find((e: IFriendship) => {
        if (e.followed_id === id) {
          setFollowed(true);
        }
      });
      return res.data.data;
    }, enabled: !! id
  });

  
  // Filtra o id da conversa se existe ou não 
  const existConversation = useQuery({
    queryKey: ['chat', user?.id],
    queryFn: async () => await await makeRequest.get(`/conversation/?userid=${user?.id}`)
     .then((res)=>{
      return res.data.data.map((e:IChat)=> {
        if(e.id === user?.id){
          setIdExistConvers(e.id); 
          setExistConvers(true); 
          return true
        }else{
          setExistConvers(false);
          setIdExistConvers(e.id);
        }

        return res.data.data
      })
     }),
    enabled: !!user?.id,
  });
  

  // Mutação para seguir/deixar de seguir o perfil
  const mutation = useMutation({
    mutationFn: async (paraDeSeguir: { 
      follower_id: number; 
      followed_id: number; 
      followed: boolean;
    }) => {
      if (paraDeSeguir.followed) {
        return makeRequest
          .delete(`/friendship/?follower_id=${paraDeSeguir.follower_id}&followed_id=${paraDeSeguir.followed_id}`)
          .then((res) => {
            setFollowed(false);
            return res.data;
          });
      } else {
        return await makeRequest
          .post(`/friendship/`, {
            follower_id: paraDeSeguir.follower_id,
            followed_id: paraDeSeguir.followed_id,
          })
          .then((res) => {
            setFollowed(true);
            return res.data;
          });
      }
    },
    onSuccess: () => {
      setFollowed(false);
      // Invalida a query para que as informações de amizade sejam atualizadas
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
    },
    onError: (error) => {
      console.error('Erro na mutação:', error);
    }
  });

  // Edita usuário
  const editeProfileMutation = useMutation({
    mutationFn: async (data: {}) => {
      return await makeRequest
        .put(`/users/update-users`, data)
        .then((res) => {
          if (user) {
            const newUser = { username: username, userimg: userimg, bgimg: bgimg, email: user.email, id:id };
            setUser(newUser);
            return res.data;
          }
          return res.data;
          
        });
    },
    onSuccess: () => {
      // Invalida a query para que as informações de amizade sejam atualizadas
      setEditProfile(false);
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
    }, onError: (error)=>{
         console.log(error)
    }
  });

  // Criar conversa
  const CreateConvers = useMutation({
    mutationFn: async (creacteConv: { user1_id: number, user2_id: number }) => 
      await makeRequest.post(`/conversation/`, { user1_id: creacteConv.user1_id, user2_id: creacteConv.user2_id })
        .then((res) => {
          return res.data.data;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
      router.push(`messagens/?conversationsId=${idexistConvers}`);
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const chareCreateConvers = async () => {
    if (existConvers) {
      router.push(`/messagens/?conversationsId=${idexistConvers}`);
      return;
    } else {
      if (user && id) {
        CreateConvers.mutate({ user1_id: user?.id, user2_id: id });
      } else {
        console.error('Usuário seguido não encontrado ou usuário logado não definido');
      }
    }
  };

  

  if (profileQuery.error) {
    console.log(profileQuery.error);
  }

  
  if (existConversation.error) {
    console.log(existConversation.error);
  }

  if (friendQuery.error) {
    console.log(friendQuery.error);
  }

  return (
    <div className="w-5/6 sm:w-3/5 flex flex-col items-center">
      <div className="relative pt-4">
        <Image
          src={profileQuery.data?.bgimg
            ? profileQuery.data?.bgimg
            : 'https://www.biotecdermo.com.br/wp-content/uploads/2016/10/sem-imagem-10.jpg'}
          className="rounded-xl" alt={''}   width={32}
          layout="responsive" 
          quality={100} 
            unoptimized={true}
          height={32}      />
        <div className="flex absolute items-center bottom-[-110px] left-10">
          <Image
            src={
              profileQuery.data?.userimg
                ? profileQuery.data?.userimg
                : 'https://img.freepik.com/free-icon/user_318-159711.jpg'
            }
            alt="imagem do perfil"
            className="w-40 h-40 rounded-full border-zinc-100 border-4"
            width={32}
            quality={100} 
            unoptimized={true}
            height={32}
          />
          <span className="text-xl sm:text-lg md:text-xl lg:text-2xl font-bold pl-2">{profileQuery.data?.username}</span>
        </div>
      </div>

      <div className="pt-36 w-5/6 sm:w-3/6 flex flex-col items-center gap-4">
        {user?.id !== id ? (
          <div className="flex flex-row">
            <button
              className={`w-1/2 p-2 hover:bg-red-500 rounded-md font-semibold ${followed ? 'bg-zinc-300 hover:text-back' : 'bg-green-600 text-white hover:bg-green-700'}`}
              onClick={() => user && mutation.mutate({ follower_id: user.id, followed_id: id, followed })}
            >
              {followed ? 'Deixar de seguir' : 'Seguir'}
            </button>
            <button
              className="bg-zinc-300 rounded-md font-semibold hover:bg-blue-500 ml-2 p-4"
              onClick={() => chareCreateConvers()}
            >
              Mensagem
            </button>
          </div>
        ) : (
          <button
            className="w-1/2 py-2 font-semibold bg-zinc-300 hover:text-back"
            onClick={() => setEditProfile(true)}
          >
            Editar Perfil
          </button>
        )}
        {editProfile && (
          <div className="fixed top-0 bottom-0 right-0 left-0 bg-[#00000094] z-10 flex items-center justify-center">
            <div className="bg-white w-2/3 rounded-xl flex flex-col items-center">
              <header className="w-full border-b font-semibold text-lg text-zinc-600 flex justify-between items-center p-2">
                Editar Perfil
                <button>
                  <FaTimesCircle className="text-red-600" onClick={() => setEditProfile(false)} />
                </button>
              </header>
              <form className="w-2/3 py-8 flex flex-col gap-8">
                <AuthInput label="Nome:"  newState={setUsername} />
                <AuthInput label="Imagem do perfil (url):" newState={setUserimg} />
                <AuthInput label="Imagem de fundo (url):" newState={setBgimg} />
                <button
                  className="w-1/2 py-2 font-semibold bg-zinc-300 hover:text-back self-center"
                  onClick={(e:MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    editeProfileMutation.mutate({ username:username, userimg: userimg, bgimg:bgimg, id:id });
                  }}
                >
                  SALVAR
                </button>
              </form>
            </div>
          </div>
        )}
        <Feed post={postQuery.data} />
      </div>
    </div>
  );
}

export default Profile;
