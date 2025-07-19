"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaUsers, FaHeart, FaComments, FaShare, FaMobile, FaShieldAlt } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verifica se o usuário está logado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          credentials: 'include'
        });
        if (response.ok) {
          router.push('/main');
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaUsers className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SocialConnect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="px-6 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Entrar
              </Link>
              <Link 
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Conecte-se
              </span>
              <br />
              <span className="text-gray-800">com o mundo</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compartilhe momentos, conecte-se com amigos e descubra um mundo de possibilidades 
              em nossa rede social moderna e intuitiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Começar Agora
              </Link>
              <Link 
                href="/login"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">João Silva</h3>
                      <p className="text-sm text-gray-500">2 min atrás</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">Acabei de chegar de uma viagem incrível! 🌍✈️</p>
                  <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg h-32 flex items-center justify-center">
                    <span className="text-gray-600">📸 Foto da viagem</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaUsers className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Maria Santos</h3>
                      <p className="text-sm text-gray-500">5 min atrás</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">Café da manhã perfeito para começar o dia! ☕🥐</p>
                  <div className="bg-gradient-to-r from-orange-200 to-yellow-200 rounded-lg h-32 flex items-center justify-center">
                    <span className="text-gray-600">☕ Café da manhã</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaUsers className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pedro Costa</h3>
                      <p className="text-sm text-gray-500">10 min atrás</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">Trabalhando em um novo projeto hoje. Muito empolgado! 💻🚀</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <FaHeart className="text-red-500" />
                      <FaComments className="text-blue-500" />
                      <FaShare className="text-green-500" />
                    </div>
                    <span className="text-sm text-gray-500">12 curtidas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Por que escolher o SocialConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra as funcionalidades que tornam nossa plataforma única e especial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Conexões Reais</h3>
              <p className="text-gray-600">
                Conecte-se com amigos, família e pessoas que compartilham seus interesses
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShare className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Compartilhamento Fácil</h3>
              <p className="text-gray-600">
                Compartilhe fotos, vídeos e momentos especiais com apenas alguns cliques
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaComments className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Mensagens Privadas</h3>
              <p className="text-gray-600">
                Converse em tempo real com seus amigos através de mensagens privadas
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMobile className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Design Responsivo</h3>
              <p className="text-gray-600">
                Acesse de qualquer dispositivo com nosso design adaptável e moderno
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Interações</h3>
              <p className="text-gray-600">
                Curta, comente e interaja com o conteúdo dos seus amigos
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Segurança</h3>
              <p className="text-gray-600">
                Sua privacidade e segurança são nossas prioridades
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de usuários que já descobriram o SocialConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Criar Conta Grátis
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-white" />
                </div>
                <h3 className="text-xl font-bold">SocialConnect</h3>
              </div>
              <p className="text-gray-400">
                Conectando pessoas, compartilhando momentos, criando memórias.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SocialConnect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
