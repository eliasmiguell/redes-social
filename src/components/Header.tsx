"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState, useEffect } from 'react';
import { FaSearch, FaBell, FaUserFriends, FaFacebookMessenger } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HiChevronDown } from "react-icons/hi";
import { makeRequest } from '../../axios';
import { IoMenu, IoLogOut } from "react-icons/io5";
import { MdMenuOpen } from "react-icons/md";
import { UserContext } from '@/context/UserContext';
import { INotification, IUser } from '@/interface';

function Header() {
  const { user, setUser } = useContext(UserContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showhamburger, setShowHamburger] = useState(false);
  const [searchResult, setSearchReult] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [isMobile, SetIsMobile] = useState(false);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return await makeRequest.post("auth/logout").then((res) => res.data);
    },
    onSuccess: () => {
      setUser(undefined);
      localStorage.removeItem("rede-social:user");
      router.push('login');
    },
  });
  // useEffect(() => {
  //   if (user) {
  //     if (!user) return;
  //   }
  // }, [user, setUser]);
  
  
  
  useEffect(() => {
    if (user && Array.isArray(user) && user.length > 0) {
      setUser({
        username: user[0].username,
        userimg: user[0].userimg,
        id: user[0].id,
        email: user[0].email,
      });
    }
  }, [user, setUser]);

  const { data, error } = useQuery({
    queryKey: ['search'],
    queryFn: async () =>
      await makeRequest.get(`search/search-users?params=${search}`).then((res) => res.data.data),
    enabled: !!search,
  });

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    const handleSizeScreen = () => {
      SetIsMobile(window.innerWidth < 640);
    };

    handleSizeScreen();

    window.addEventListener('resize', handleSizeScreen);

    return () => window.removeEventListener('resize', handleSizeScreen);
  }, []);


  const GetNotification = useQuery<INotification[] | undefined>({
    queryKey: ['notification', user?.id],
    queryFn: () =>
      makeRequest.get(`/notifications/?id_user=${user?.id}`).then((res) => res.data.data),
    enabled: !!user?.id,
  });

  if (GetNotification.error) {
    console.log(GetNotification.error);
  }

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

  return (
    <>
      <div className="w-0/1">
        {showhamburger && isMobile ? (
          <div
            className="fixed z-10 w-[50%] flex pb-4 pl-4 bg-[#1a1a1a94] pt-[60px]"
            onMouseLeave={() => setShowHamburger(false)}
          >
            <nav className="flex flex-col gap-6 text-gray600 font-seminold text-white">
              <Link className="flex gap-2 itemns-center " href={`/profile?id=${user?.id}`}>
                <Image
                  src={user?.userimg ? user?.userimg : "https://img.freepik.com/free-icon/user_318-159711.jpg"}
                  alt="Imagem do perfil"
                  className="w-8 h-8 rounded-full"
                  width={32}
                  height={32}
                />
                <span className="font-semibold">{user?.username}</span>
              </Link>
              <Link href="/followed" className="flex gap-3 itemns-center">
                <FaUserFriends className="w-6 h-6" />
                Seguidores
              </Link>
              <Link href="/messagens" className="flex gap-3 itemns-center">
                <FaFacebookMessenger className="w-6 h-6" />
                Mensagens
              </Link>
              <Link href="/notifications" className="flex gap-3 itemns-center">
                <FaBell className="w-6 h-6" />
                Notificações
              </Link>
              <Link href="" className="flex gap-3 itemns-center" onClick={() => mutation.mutate()}>
                <IoLogOut className="w-6 h-6" />
                Sair
              </Link>
            </nav>
          </div>
        ) : (
          ''
        )}
      </div>
      <header className="fixed z-10 w-full bg-white flex justify-between py-2 px-4 items-center shadow-md">
        <Link href="/main" className="font-bold text-sky-900 text-lg">
          Redes Sociais
        </Link>
        <div
          className="flex bg-zinc-100 items-center text-gray-600 px-3 py-1 rounded-full relative"
          onClick={() => setSearchReult(true)}
          onMouseLeave={() => setSearchReult(false)}
        >
          <input
            type="text"
            value={search ? search : ''}
            placeholder="Pesquisar"
            className="bg-zinc-100 focus-visible:outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch />

          {search && searchResult && (
            <div className="absolute flex-col bg-white p-4 shadow-md rounded-md gap-2 border-t whitespace-nowrap right-0 left-0 top-[100%]">
              {data?.map((users: IUser, id: number) => {
                return (
                  <Link
                    href={`/profile?id=${users?.id}`}
                    key={id}
                    className="flex items-center pb-2 gap-3"
                    onClick={() => {
                      setSearch(null);
                      setSearchReult(false);
                    }}
                  >
                    <Image
                      src={users?.userimg || "https://img.freepik.com/free-icon/user_318-159711.jpg"}
                      alt="Imagem do perfil"
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                      quality={100} 
                      unoptimized={true}
                    />
                    <span className="font-bold">{users?.username}</span>
                  </Link>
                );
              })}
              <Link
                href={`search?params=${search}`}
                onClick={() => {
                  setSearch(null);
                  setSearchReult(false);
                }}
                className="font-semibold border-t border-zinc-300 text-ceter pt-0"
              >
                Ver todos os resultados
              </Link>
            </div>
          )}
        </div>

        {isMobile ? (
          <div onClick={() => setShowHamburger(!showhamburger)}>
            {showhamburger ? (
              <MdMenuOpen className="w-8 h-8" />
            ) : (
              <IoMenu className="w-8 h-8" />
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-5 items-center text-gray-600">
              <div className="flex gap-4">
                <Link href="/messagens" className=" relative bg-zinc-200 p-5 rounded-full hover:bg-zinc-300">
                  <FaFacebookMessenger />
                  {totalUnreadMessages > 0 && (
                  <span className="absolute top-0 right-[1px] bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalUnreadMessages}
                  </span>
                  )}
                </Link>
                <Link href="/notifications" className="bg-zinc-200 p-5 rounded-full hover:bg-zinc-300">
                  <FaBell />
                </Link>
              </div>

              <div className="relative" onMouseLeave={() => setShowMenu(false)}>
                <button className="flex gap-2 items-center" onClick={() => setShowMenu(!showMenu)}>
                  <Image
                    src={user?.userimg ? user.userimg : "https://img.freepik.com/free-icon/user_318-159711.jpg"}
                    alt="Imagem do perfil"
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
                    quality={100} 
                    unoptimized={true}
                  />
                  <span className="font-bold">{user?.username}</span>
                  <HiChevronDown className="w-8 h-8" />
                </button>
                {showMenu && (
                  <div className="absolute flex-col bg-white p-4 shadow-md rounded-md gap-2 border-t whitespace-nowrap right-[-8px]">
                    <Link href={`/editprofile?id=${user?.id}`} className="border-b">
                      Editar perfil
                    </Link>
                    <br />
                    <Link href="" onClick={() => mutation.mutate()}>
                      Sair
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}

export default Header;
