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
      {/* Menu mobile */}
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
        ) : null}
      </div>

      {/* Header principal */}
      <header className="fixed z-10 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 flex justify-between py-3 px-6 items-center shadow-sm">
        <Link href="/main" className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SocialConnect
        </Link>
        
        {/* Barra de pesquisa */}
        <div
          className="flex bg-gray-50 items-center text-gray-600 px-4 py-2 rounded-full relative border border-gray-200 hover:border-gray-300 transition-colors"
          onClick={() => setSearchReult(true)}
          onMouseLeave={() => setSearchReult(false)}
        >
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search ? search : ''}
            placeholder="Pesquisar usuários..."
            className="bg-transparent focus-visible:outline-none w-64"
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && searchResult && (
            <div className="absolute flex-col bg-white p-4 shadow-md rounded-md gap-2 border-t whitespace-nowrap right-0 left-0 top-[100%]">
              {data?.map((users: IUser) => {
                return (
                  <Link
                    href={`/profile?id=${users?.id}`}
                    key={users.id}
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

        {/* Ações do usuário */}
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
              <div className="flex gap-3">
                <Link href="/messagens" className="relative bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                  <FaFacebookMessenger className="text-gray-600" />
                  {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalUnreadMessages}
                  </span>
                  )}
                </Link>
                <Link href="/notifications" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                  <FaBell className="text-gray-600" />
                </Link>
              </div>

              <div className="relative" onMouseLeave={() => setShowMenu(false)}>
                <button className="flex gap-2 items-center hover:bg-gray-100 p-2 rounded-full transition-colors" onClick={() => setShowMenu(!showMenu)}>
                  <Image
                    src={user?.userimg ? user.userimg : "https://img.freepik.com/free-icon/user_318-159711.jpg"}
                    alt="Imagem do perfil"
                    className="w-8 h-8 rounded-full object-cover"
                    width={32}
                    height={32}
                    quality={100} 
                    unoptimized={true}
                  />
                  <span className="font-semibold text-gray-800">{user?.username}</span>
                  <HiChevronDown className="text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10">
                    <Link
                      href={`/profile?id=${user?.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
                      onClick={() => setShowMenu(false)}
                    >
                      <FaUserFriends className="text-gray-500" />
                      Ver perfil
                    </Link>
                    <button
                      onClick={() => {
                        mutation.mutate();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm w-full"
                    >
                      <IoLogOut className="text-gray-500" />
                      Sair
                    </button>
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
