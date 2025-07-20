'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSearchParams } from 'next/navigation'; 
import Feed from '@/components/Feed';
import { useContext, useState, MouseEvent } from 'react';
import { UserContext } from '@/context/UserContext';
import { IPost, IFriendship, IChat } from '@/interface'; 
import { FaTimesCircle } from 'react-icons/fa';
import { FaUserFriends, FaComments, FaEdit } from 'react-icons/fa';
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
    mutationFn: async (data: { username: string; userimg: string; bgimg: string; id: number }) => {
      return await makeRequest
        .put(`/users/update-users`, data)
        .then((res) => {
          if (user) {
            const newUser = { username: username, userimg: userimg, bgimg: bgimg, email: user.email, id: id! };
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
  if (!id) {
    return <div>Usuário não encontrado.</div>; // Evitar retornar antes de chamar os hooks
  }
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header do perfil */}
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Imagem de fundo */}
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {profileQuery.data?.bgimg ? <Image
          src={profileQuery.data?.bgimg.includes('http') ? profileQuery.data?.bgimg : `https://api-redes-sociais.onrender.com/uploads/${profileQuery.data?.bgimg}`}
            alt="Imagem de fundo do perfil"
          className="rounded-xl"   width={32}
          layout="responsive" 
          quality={100} 
            unoptimized={true}
          height={32}      /> : <Image src={"https://www.biotecdermo.com.br/wp-content/uploads/2016/10/sem-imagem-10.jpg"} alt="Imagem de fundo do perfil" width={32} height={32} quality={100} unoptimized={true}/>}
          {/* Botão de upload removido - usando apenas URLs */}
          {/* {user?.id === id && (
            <button
              onClick={() => bgImageRef.current?.click()}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
            >
              <FaCamera className="text-white text-lg" />
            </button>
          )}
          <input
            ref={bgImageRef}
            type="file"
            accept="image/*"
            onChange={handleBgImageChange}
            className="hidden"
          /> */}
        </div>

        {/* Informações do perfil */}
        <div className="relative px-6 pb-6">
          <div className="flex items-end -mt-20 mb-4">
            <div className="relative">
            {profileQuery.data?.userimg ? <Image
          src={profileQuery.data?.userimg.includes('http') ? profileQuery.data?.userimg : `https://api-redes-sociais.onrender.com/uploads/${profileQuery.data?.userimg}`}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" alt="Imagem do perfil"   width={128}
          quality={100} 
            unoptimized={true}
          height={128}      /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" width={128} height={128} quality={100} unoptimized={true}/>} 
              {/* Botão de upload removido - usando apenas URLs */}
              {/* {user?.id === id && (
                <button
                  onClick={() => profileImageRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <FaCamera className="text-white text-sm" />
                </button>
              )}
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              /> */}
            </div>
            
            <div className="ml-6 mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{profileQuery.data?.username}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FaUserFriends className="text-blue-600" />
                  <span>Seguidores</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComments className="text-green-600" />
                  <span>Posts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4">
            {user?.id !== id ? (
              <>
                <button
                  className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                    followed 
                      ? 'bg-gray-200 text-gray-800 hover:bg-red-500 hover:text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={() => user && mutation.mutate({ follower_id: user.id, followed_id: id, followed })}
                >
                  {followed ? 'Deixar de seguir' : 'Seguir'}
                </button>
                <button
                  className="px-6 py-3 bg-gray-100 text-gray-800 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  onClick={() => chareCreateConvers()}
                >
                  <FaComments />
                  Mensagem
                </button>
              </>
            ) : (
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => setEditProfile(true)}
              >
                <FaEdit />
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      {editProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Editar Perfil</h2>
              <button
                onClick={() => setEditProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimesCircle className="text-gray-500 text-xl" />
              </button>
            </div>
            
            <form className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu nome de usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de perfil (URL)
                </label>
                <input
                  type="text"
                  value={userimg}
                  onChange={(e) => setUserimg(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Cole aqui o link direto da imagem</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de fundo (URL)
                </label>
                <input
                  type="text"
                  value={bgimg}
                  onChange={(e) => setBgimg(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com/imagem-fundo.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Cole aqui o link direto da imagem</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditProfile(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  className="w-1/2 py-2 font-semibold bg-zinc-300 hover:text-back self-center"
                  onClick={(e:MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    editeProfileMutation.mutate({ username:username, userimg: userimg, bgimg:bgimg, id:id });
                  }}
                >
                  SALVAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed de posts */}
      <div className="mt-8">
        <Feed post={postQuery.data} />
      </div>
    </div>
  );
}

export default Profile;
