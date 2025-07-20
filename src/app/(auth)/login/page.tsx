'use client'
import Link from 'next/link';
import { useContext, useState } from 'react';
import {toast} from 'react-toastify'
import { makeRequest } from '../../../../axios';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

function Login() {
  const {setUser} = useContext(UserContext)
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await makeRequest.post('auth/login', { email, password });
      
      // Atualizar o contexto do usuário (isso também salva no localStorage)
      setUser(res.data.user);
      
      // Mostrar mensagem de sucesso
      toast.success('Login realizado com sucesso!');
      
      // Aguardar um pouco para garantir que o contexto foi atualizado
      setTimeout(() => {
        router.push('/main');
      }, 100);
      
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erro ao fazer login';
      toast.error(errorMessage);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <FaSignInAlt className="text-white text-lg sm:text-2xl" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Bem-vindo</h1>
            <p className="text-sm sm:text-base text-gray-600">Faça login na sua conta</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
        {/* Campo Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
              placeholder="Digite seu email"
              required
            />
          </div>
        </div>

        {/* Campo Senha */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
              placeholder="Digite sua senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Botão de Login */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              Entrando...
            </>
          ) : (
            <>
              <FaSignInAlt />
              Entrar
            </>
          )}
        </button>
      </form>

      {/* Links adicionais */}
      <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <Link 
          href="/register" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
        >
          <FaUserPlus />
          Criar uma nova conta
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-xs text-gray-500">
          Ao fazer login, você concorda com nossos{' '}
          <Link href="#" className="text-blue-600 hover:underline">Termos de Serviço</Link>
          {' '}e{' '}
          <Link href="#" className="text-blue-600 hover:underline">Política de Privacidade</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;