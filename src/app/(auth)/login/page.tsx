'use client'
import AuthInput from '@/components/AuthInput';
import Link from 'next/link';
import { useContext, useState } from 'react';
import {toast} from 'react-toastify'
import { makeRequest } from '../../../../axios';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';



function Login() {
  
const {setUser} = useContext(UserContext)
const router = useRouter();
const [email, setEmail] = useState('')
const [password, setPassword ] = useState('')


const handleLogin = async (e:any)=>{
  
  e.preventDefault();
  await makeRequest.post('auth/login',{email, password})
      .then((res)=>{
        localStorage.setItem("rede-social:user", JSON.stringify(res.data.user));
        setUser( res.data.user)
        router.push('/main')
      }).catch((err)=>{
        // toast.error(err.response.data.message);
        console.log(err);
      })

}



  return(
   <>
        <h1 className=" font-bold text-2xl ">LOGIN</h1>
        <AuthInput label="Email:" newState={setEmail}/>
        <AuthInput label="Senha:" newState={setPassword} IsPassaword/>

    <button
      onClick={(e) =>handleLogin(e) } 
      className="bg-green-600 py-3 font-bold text-white rounded-lg hover:bg-green-800"
    >LOGAR
    </button>
        <Link href='/register' className="tex-center underline">Cadastrar-se</Link>
    </>

  );
}
export default Login;