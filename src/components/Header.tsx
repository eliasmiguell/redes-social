"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useContext, useState, useEffect } from 'react';
import { FaSearch, FaBell, FaUserFriends, FaFacebookMessenger } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HiChevronDown } from "react-icons/hi";
import { makeRequest } from '../../axios';
import { IoLogOut } from "react-icons/io5";
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
        bgimg: user[0].bgimg || '',
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
            className="fixed z-20 w-full h-full bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHamburger(false)}
          >
            <div
              className="fixed z-30 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Header do menu */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    {user?.userimg ? <Image
                      src={user?.userimg.includes('http') ? user?.userimg : `https://api-redes-sociais.onrender.com/uploads/${user?.userimg}`}
                      alt="Imagem do perfil"
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                      width={48}
                      height={48}
                      quality={100} 
                      unoptimized={true}
                    /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-12 h-12 rounded-full border-2 border-white/20" width={48} height={48} quality={100} unoptimized={true}/>}
                    <div>
                      <h3 className="font-bold text-lg">{user?.username}</h3>
                      <p className="text-blue-100 text-sm">Bem-vindo de volta!</p>
                    </div>
                  </div>
                </div>

                {/* Navegação */}
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    <Link 
                      className="flex items-center gap-4 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group" 
                      href={`/profile?id=${user?.id}`}
                      onClick={() => setShowHamburger(false)}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <FaUserFriends className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium">Meu Perfil</span>
                    </Link>
                    
                    <Link 
                      href="/followed" 
                      className="flex items-center gap-4 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group"
                      onClick={() => setShowHamburger(false)}
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <FaUserFriends className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium">Seguidores</span>
                    </Link>
                    
                    <Link 
                      href="/messagens" 
                      className="flex items-center gap-4 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group"
                      onClick={() => setShowHamburger(false)}
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors relative">
                        <FaFacebookMessenger className="w-5 h-5 text-purple-600" />
                        {totalUnreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {totalUnreadMessages}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">Mensagens</span>
                    </Link>
                    
                    <Link 
                      href="/notifications" 
                      className="flex items-center gap-4 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group"
                      onClick={() => setShowHamburger(false)}
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <FaBell className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium">Notificações</span>
                    </Link>
                  </div>
                </nav>

                {/* Footer do menu */}
                <div className="p-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      mutation.mutate();
                      setShowHamburger(false);
                    }}
                    className="flex items-center gap-4 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full group"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <IoLogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Header principal */}
      <header className="fixed z-10 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 flex justify-between py-3 px-4 sm:px-6 items-center shadow-sm">
        <Link href="/main" className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SocialConnect
        </Link>
        
        {/* Barra de pesquisa */}
        <div
          className={`flex bg-gray-50 items-center text-gray-600 px-3 sm:px-4 py-2 rounded-full relative border border-gray-200 hover:border-gray-300 transition-colors ${isMobile ? 'hidden' : ''}`}
          onClick={() => setSearchReult(true)}
          onMouseLeave={() => setSearchReult(false)}
        >
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search ? search : ''}
            placeholder="Pesquisar usuários..."
            className="bg-transparent focus-visible:outline-none w-48 sm:w-64"
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && searchResult && (
            <div className="absolute flex-col bg-white p-4 shadow-md rounded-md gap-2 border-t whitespace-nowrap right-0 left-0 top-[100%] z-50">
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
                    {users?.userimg ? <Image
                      src={users?.userimg.includes('http') ? users?.userimg : `https://api-redes-sociais.onrender.com/uploads/${users?.userimg}`}
                      alt="Imagem do perfil"
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                      quality={100} 
                      unoptimized={true}
                    /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-8 h-8 rounded-full" width={32} height={32} quality={100} unoptimized={true}/>}
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

        {/* Barra de pesquisa mobile */}
        {isMobile && searchResult && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 p-4 shadow-lg">
            <div className="flex bg-gray-50 items-center text-gray-600 px-4 py-3 rounded-full border border-gray-200">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                value={search ? search : ''}
                placeholder="Pesquisar usuários..."
                className="bg-transparent focus-visible:outline-none flex-1"
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <button
                onClick={() => setSearchReult(false)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {search && data && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {data?.map((users: IUser) => (
                  <Link
                    href={`/profile?id=${users?.id}`}
                    key={users.id}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSearch(null);
                      setSearchReult(false);
                    }}
                  >
                    <Image
                      src={users?.userimg || "https://img.freepik.com/free-icon/user_318-159711.jpg"}
                      alt="Imagem do perfil"
                      className="w-10 h-10 rounded-full mr-3"
                      width={40}
                      height={40}
                      quality={100} 
                      unoptimized={true}
                    />
                    <span className="font-medium text-gray-800">{users?.username}</span>
                  </Link>
                ))}
                <Link
                  href={`search?params=${search}`}
                  onClick={() => {
                    setSearch(null);
                    setSearchReult(false);
                  }}
                  className="block p-2 text-center text-blue-600 font-medium border-t border-gray-100"
                >
                  Ver todos os resultados
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Ações do usuário */}
        {isMobile ? (
          <div className="flex items-center gap-3">
            {/* Botão de pesquisa no mobile */}
            <button
              onClick={() => setSearchReult(!searchResult)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaSearch className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Botão hambúrguer melhorado */}
            <button
              onClick={() => setShowHamburger(!showhamburger)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors relative"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
                <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${showhamburger ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${showhamburger ? 'opacity-0' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${showhamburger ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
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
