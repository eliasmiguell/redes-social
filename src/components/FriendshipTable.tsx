'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { useContext } from 'react';
import Image from 'next/image';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import { IFriendship } from '@/interface';


function FriendshipTable() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  // Pega os amigos
  const GetFriends = useQuery<IFriendship[] | undefined>({
    queryKey: ['friendship', user?.id],
    queryFn: () => makeRequest.get(`friendship/?follower_id=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });


  // Mutação para parar de seguir
  const mutation = useMutation({
    mutationFn: async (paraDeSeguir: { follower_id: number; followed_id: number }) =>
      await makeRequest
        .delete(`/friendship/?follower_id=${paraDeSeguir.follower_id}&followed_id=${paraDeSeguir.followed_id}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendship', user?.id] });
    },
  });

  if (!user || !user.id) {
    return <div>Loading...</div>;
  }
  if (GetFriends.error) {
    console.log(GetFriends.error);
  }
  return (
    <div className="w-full mr-2 text-gray-600 flex items-center flex-col gap-2">
      <div className="mb-4">
        <span className="font-bold border-b text-2xl whitespace-nowrap">Seus seguidores</span>
      </div>

      {GetFriends.data?.map((friendship: IFriendship) => {
        return (
          <ul key={friendship.id && friendship.id} className="flex gap-3 lg:flex-row items-center justify-between my-2">
            <li className="item flex">
              <Link className="flex gap-3 items-center w-full" href={`/profile?id=${friendship.followed_id  &&friendship.followed_id }`}>
                <Image
                  src={friendship?.userimg ? friendship?.userimg : 'https://img.freepik.com/free-icon/user_318-159711.jpg'}
                  alt="Imagem do perfil"
                  className="w-10 h-10 rounded-lg object-cover"
                  quality={100} 
                  unoptimized={true}
                  width={32}
                  height={32}
                />
                <span className="font-bold text-x ">{friendship?.username}</span>
                <span hidden id={`${friendship?.followed_id}`} className="item">
                  {friendship?.followed_id}
                </span>
              </Link>
              <button
                className="py-1 w-[200px] bg-zinc-300 font-semibold rounded-md hover:text-white hover:bg-blue-500"
                onClick={() =>
                  mutation.mutate({
                    followed_id: friendship.followed_id,
                    follower_id:user.id && user.id,
                  })
                }
              >
                Deixar de seguir
              </button>
            </li>
          </ul>
        );
      })}
    </div>
  );
}

export default FriendshipTable;
