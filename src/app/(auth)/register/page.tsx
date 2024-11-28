"use client"
import AuthInput from '@/components/AuthInput';
import Link from 'next/link';
import {  MouseEvent, useState } from 'react';
import {toast} from 'react-toastify';
import { makeRequest } from '../../../../axios';

function Register() {
 const [username, setUserName] = useState('')
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [error, setError]= useState('')
 const [sucess, setSucess]= useState('')
 
 const handleRegister = async (e:MouseEvent<HTMLButtonElement>)=>{
  e.preventDefault();
  
   await makeRequest.post('auth/register', {username, email, password, confirmPassword})
         .then((res)=>{
          console.log( res.data)
          setSucess(res.data)
          toast.success(res.data);
          setError('');
        })
         .catch((err)=>{
          setSucess('');
          toast.error(err.response.data.message);
          setError(err.response.data.message);
          console.log(err);
        });
 }

  return(
    <>
      <h1 className=" font-bold text-2xl  ">REGISTER</h1>
      <AuthInput label="Nome:" newState={setUserName}/>
      <AuthInput label="Email:" newState={setEmail}/>
      <AuthInput label="Senha:" newState={setPassword} IsPassaword/>
      <AuthInput label="Confirme a sua senha:" newState={setConfirmPassword} IsPassaword/>
      {error.length > 0 && <span className="text-red-600">* {error}</span>}
      {sucess.length > 0 && <span className="text-green-600">* {sucess}</span>}
      <button
      onClick={(e) =>handleRegister (e) } 
      className="bg-green-600 py-3 font-bold text-white rounded-lg hover:bg-green-800"
    >LOGAR
    </button>
      <Link href='/login' className="tex-center underline">Logar</Link>
   </>
  );
}

export default Register;