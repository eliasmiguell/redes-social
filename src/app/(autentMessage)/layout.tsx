"use client"; 
import Header from '@/components/Header';
import ListConversations from '@/components/ListConvesations';
import { ReactNode, useState, useEffect } from 'react';
import { FaComments, FaArrowLeft } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MainMessage({children}:{children:ReactNode}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationsId = searchParams.get('conversationsId');

  // Detectar se é mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // No mobile, se há uma conversa selecionada, esconde a sidebar
  const shouldShowSidebar = !isMobile || (!conversationsId && showSidebar);

  // Fechar sidebar quando uma conversa é selecionada no mobile
  useEffect(() => {
    if (isMobile && conversationsId) {
      setShowSidebar(false);
    }
  }, [conversationsId, isMobile]);

  // Resetar estado de navegação quando conversationsId mudar
  useEffect(() => {
    setIsNavigating(false);
  }, [conversationsId]);

  // Função para voltar à lista de conversas
  const handleBackToConversations = () => {
    if (isMobile) {
      setIsNavigating(true);
      // No mobile, navega de volta para a página de conversas com pequeno delay
      setTimeout(() => {
        router.push('/messagens');
      }, 100);
    } else {
      // No desktop, apenas mostra a sidebar
      setShowSidebar(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16 h-screen">
        {/* Overlay para fechar sidebar no mobile */}
        {isMobile && showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar de conversas - responsivo */}
        <div className={`${
          shouldShowSidebar 
            ? 'w-full md:w-80' 
            : 'w-0 md:w-80'
        } bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isMobile && !shouldShowSidebar ? 'hidden' : 'block'
        } ${isMobile && showSidebar ? 'fixed left-0 top-16 h-full z-50' : ''}`}>
          <ListConversations 
            onClose={() => setShowSidebar(false)} 
            isMobile={isMobile} 
          />
        </div>
        
        {/* Área principal do chat */}
        <div className="flex-1 bg-white relative">
          {/* Botão para voltar à lista de conversas (mobile) */}
          {isMobile && conversationsId && (
            <button
              onClick={handleBackToConversations}
              disabled={isNavigating}
              className={`absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors ${
                isNavigating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaArrowLeft className={`text-gray-600 ${isNavigating ? 'animate-pulse' : ''}`} />
            </button>
          )}

          {/* Botão para mostrar conversas (mobile) */}
          {isMobile && !conversationsId && (
            <button
              onClick={() => setShowSidebar(true)}
              className="absolute top-4 left-4 z-10 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-md hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <FaComments />
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}