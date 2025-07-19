'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { makeRequest } from '../../axios';
import Image from 'next/image';


function EditProfile() {
  const { user, setUser } = useContext(UserContext);
  const searchParams = useSearchParams()
  const router = useRouter();
  const userId =searchParams.get('id');
  const id = userId ? parseInt(userId) : user?.id;
  
  const queryClient = useQueryClient();

  // Hooks são sempre chamados
  const [username, setUsername] = useState('');
  const [userimg, setUserimg] = useState('');
  const [bgimg, setBgimg] = useState('');



  const profileQuery = useQuery({
    queryKey: ["profile", id],
    queryFn:async () => await makeRequest.get(`/users/get-users?id=${id}`)
              .then((res) => {
              setUsername(res.data[0].username)
              setUserimg(res.data[0].userimg)
              setBgimg(res.data[0].bgimg)
              return res.data[0]
              })
  })
  
  if (profileQuery.error) {
    console.log(profileQuery.error);
  }
  
  

  const editeProfileMutation = useMutation({
    mutationFn: async (data: { username: string; userimg: string; bgimg: string; id: number }) => {
      console.log(1, data)
      console.log(3, user)
        return await makeRequest.put(`users/update-users`, data).then((res)=>{
          if (user) {
            const newUser = {
              username: data.username,
              userimg: data?.userimg,
              bgimg: data?.bgimg,
              email: user?.email,
              id:data.id
            };

            setUser(newUser);
            return res.data;
          }
          
        });
        
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile',id] });
      toast.success('Perfil atualizado com sucesso!'); // Mensagem de sucesso
      router.push('/main')
    },
    onError: () => {
      toast.error('Erro ao atualizar o perfil. Tente novamente.'); // Mensagem de erro
    },
  });

  if (editeProfileMutation.error) {
    console.log(editeProfileMutation.error);
 
  }

  // Condicional para o conteúdo, mas os hooks foram chamados antes
  if (!id) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <div className="flex items-center w-5/6 sm:w-2/6 justify-center ">
      <div className="bg-white w-full rounded-xl flex flex-col items-center rounded-lg p-4 shadow-md">
        <header className="w-full border-b font-semibold text-lg text-zinc-600 flex justify-between items-center p-2">
          Editar Perfil
        </header>
        <form className="w-2/3 py-8 flex flex-col gap-8">
          <div className="flex flex-col justify-between items-start">
            <label className="font-medium text-gray-700">Nome:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="border-gray-400 border-b w-full focus-visible:outline-none focus:border-blue-500 p-2" 
            />
          </div>
          
          <div className="flex flex-col justify-between items-start">
            <label className="font-medium text-gray-700">Imagem do perfil (URL):</label>
            <input 
              type="text" 
              value={userimg || ''} 
              onChange={(e) => setUserimg(e.target.value)} 
              placeholder="https://exemplo.com/imagem.jpg"
              className="border-gray-400 border-b w-full focus-visible:outline-none focus:border-blue-500 p-2" 
            />
            <p className="text-xs text-gray-500 mt-1">Cole aqui o link direto da imagem (deve terminar em .jpg, .png, etc.)</p>
            {userimg && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Prévia:</p>
                <Image 
                  src={userimg} 
                  alt="Prévia da imagem de perfil" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  width={64}
                  height={64}
                  quality={100} 
                  unoptimized={true}
                />
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-between items-start">
            <label className="font-medium text-gray-700">Imagem de fundo (URL):</label>
            <input 
              type="text" 
              value={bgimg || ''} 
              onChange={(e) => setBgimg(e.target.value)} 
              placeholder="https://exemplo.com/imagem-fundo.jpg"
              className="border-gray-400 border-b w-full focus-visible:outline-none focus:border-blue-500 p-2" 
            />
            <p className="text-xs text-gray-500 mt-1">Cole aqui o link direto da imagem (deve terminar em .jpg, .png, etc.)</p>
            {bgimg && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Prévia:</p>
                <Image 
                  src={bgimg} 
                  alt="Prévia da imagem de fundo" 
                  className="w-32 h-20 rounded-lg object-cover border-2 border-gray-200"
                  width={128}
                  height={80}
                  quality={100} 
                  unoptimized={true}
                />
              </div>
            )}
          </div>
          
          <button
            className={`w-1/2 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg self-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            disabled={!username.trim() || editeProfileMutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              if (!username.trim()) {
                toast.error('Nome de usuário é obrigatório');
                return;
              }
              console.log('Dados que serão enviados:', { username, userimg, bgimg, id });
              console.log('URL da requisição:', `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/update-users`);
              editeProfileMutation.mutate({ username, userimg, bgimg, id: id });
            }}
          >
            {editeProfileMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              'SALVAR'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
