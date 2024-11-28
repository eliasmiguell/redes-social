"use client"
import { Suspense } from 'react';
import Feed from '@/components/Feed';
import Share from '@/components/Share';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../../../axios';
import { IPost } from '@/interface';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';



 function Main() {
  const { user } = useContext(UserContext);
  const postQuery = useQuery<IPost[] | undefined>({
    queryKey: ['posts'],
    queryFn: async()=>
      await makeRequest.get('post/').then((res)=>{
        return res.data.data
      }),
      enabled: !!user
  })
  
  if(postQuery.error){
    console.log(postQuery.error)
  }
  return (
  <Suspense  fallback={<div>Carregando...</div>} >
    <div className="w-5/6  sm:w-2/6 flex flex-col gap-5">
      <Share/>
      <Feed post={postQuery.data}/> 
    </div>
  </Suspense>
  );
}


export default Main;
