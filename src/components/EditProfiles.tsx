'use client';
import AuthInput from '@/components/AuthInput';


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { makeRequest } from '../../axios';

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
          <AuthInput label="Nome:" newState={setUsername} />
          <AuthInput label="Imagem do perfil (url):" newState={setUserimg} />
          <AuthInput label="Imagem de fundo (url):" newState={setBgimg} />
          <button
            className={`w-1/2 py-2 font-semibold bg-zinc-300 hover:text-back self-center`}
            onClick={(e) => {
              e.preventDefault();
              editeProfileMutation.mutate({ username , userimg, bgimg, id:id });
            }}
          >
            SALVAR 
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
