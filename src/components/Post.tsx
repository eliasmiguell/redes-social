'use client'
import { UserContext } from '@/context/UserContext';
import { useContext, useState } from 'react';
import { FaPaperPlane, FaRegComment, FaThumbsUp } from 'react-icons/fa6';
import moment from 'moment';
import 'moment/locale/pt-br';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import Coment from './Coment';
import Link from 'next/link';
import Image from 'next/image';
import { IPost, IComents,  ILikes} from '@/interface';


function Post(props:{post:IPost}) {

  const {post_desc, img, username, created_at, id, userimg,userid} = props.post;
  const {user} = useContext(UserContext)
  const [coment_desc, setComent_desc] = useState('')
  const [liked, setLiked] = useState(false)
  const [showLike, setShowLike] = useState(false)
  const [showComent, setShowComent] = useState(false)
  const queryClient = useQueryClient()

  //LIKES QUERY

  const LikesQuery= useQuery<ILikes[] | undefined>({
    queryKey:['likes', id], 
    queryFn:()=> makeRequest.get(`like/?likes_postid=${id}`).then((res)=>{
      const likes = res.data.data;
      // Verificar se o usuário atual curtiu o post
      const userLiked = likes.some((like: ILikes) => like.likes_userid === user?.id);
      setLiked(userLiked);
      return likes;
    }),
    enabled: !! id
   })
  
   
  
  const LikesMutation = useMutation({
    mutationFn: async (newLikes: {likes_postid:number, likes_userid:number})=>{
      if(liked){
        await makeRequest
        .delete(`like/?likes_postid=${newLikes.likes_postid}&likes_userid=${newLikes.likes_userid}`)
        .then((res)=>{ 
          setLiked(false)
          return res.data})

      }else{
        await makeRequest.post("like/", newLikes).then((res)=>{
        return res.data})
      }
      
    }, onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:['likes', id]})
    }
  })

  const shareLikes = async ()=>{
    LikesMutation.mutate({likes_userid:Number(user?.id), likes_postid:id });
    setComent_desc('')
  }

//comment query
 const comentQuery= useQuery<IComents[] | undefined>({
  queryKey:['coments', id], 
  queryFn:async ()=> await makeRequest.get(`coment/?postid=${id}`).then((res)=>{
    return res.data.data
  }),
  enabled: !! id
 })



const comentMutation = useMutation({
  mutationFn: async (newComent: {coment_desc: string, coment_userid:number, postid:number })=>{
    await makeRequest.post("coment/", newComent).then((res)=>{
      return res.data
    })
  }, onSuccess:()=>{
    queryClient.invalidateQueries({queryKey:['coments', id]})
  }
})

const shareComent = ()=>{
  comentMutation.mutate({coment_desc, coment_userid:Number(user?.id), postid:id });
  setComent_desc('')
}

if(comentQuery.error){
  console.log(comentQuery.error)
 }
 if( LikesQuery.error){
  console.log( LikesQuery.error)
 }

  return(
    <div className='w-full bg-white rounded-lg p-4 shadow-md'>
        <header className='flex gap-2 pb-4 border-b items-center'>
          <Link href={`/profile?id=${userid}`} className='flex gap-2'>
          {userimg ? <Image
           src={userimg.includes('http') ? userimg : `https://api-redes-sociais.onrender.com/uploads/${userimg}`}
            alt="imagem do perfil " className='w-8 h-8 rounded-full'  width={32}
            height={32}
            quality={100} 
            unoptimized={true}
            /> : <Image
            src="https://img.freepik.com/free-icon/user_318-159711.jpg"
            alt="imagem do perfil " className='w-8 h-8 rounded-full'  width={32}
            height={32}
            quality={100} 
            unoptimized={true}
            />}
            <div className=' flex flex-col'>
              <span className='font-semibold'>{username}</span>
              <span className='text-xs'>{moment(created_at).local().fromNow()}</span>
            </div>
            </Link>
          </header>
          
          {post_desc && (
          <div className='py-4 w-full'>
            <span >{post_desc}</span>
          </div>)}
          {img && img.trim() !== '' && <Image src={ img.includes('http') ? img : `https://api-redes-sociais.onrender.com/uploads/${img}` } alt='imagem do post'className='rounded-lg'  width={400}
          layout="responsive" 
          quality={100} 
            unoptimized={true}
            height={400}/>}
          <div className='flex justify-between py-4 border-b'>
              <div  onMouseEnter={()=>setShowLike(true)}
                  onMouseLeave={()=>setShowLike(false)}
                  className="relative">
                {LikesQuery.data && LikesQuery.data.length > 0 && (
                  <>
                  <div className='flex gap-1 items-center cursor-pointer' 
                  >
                    <span className='bg-blue-600 w-6 h-6 text-white flex items-center justify-center rounded-full text-xs'>
                      <FaThumbsUp/>
                    </span>
                    <span>{LikesQuery.data.length}</span>
                  </div>
                {
                  showLike && (
                    <div className="absolute bg-white border border-gray-200 shadow-lg rounded-lg p-3 top-8 left-0 min-w-[200px] z-10">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Pessoas que curtiram:
                      </div>
                      <div className="space-y-1">
                        {LikesQuery.data.map((like: ILikes) => {
                          return like && like.username ? (
                            <div key={like.id} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                              {like.username}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </>
                 )}
              </div>
            <button 
            onClick={()=>setShowComent(!showComent)}>
              {comentQuery.data && comentQuery.data?.length >0 &&
              `${comentQuery.data.length} comentários`}
              </button>
          </div>
          <div className='flex justify-around py-4 text-gray-600 border-b'>
            <button className={`flex items-center gap-1 ${liked? 'text-blue-600': ''}`} onClick={()=>shareLikes() }>
              <FaThumbsUp/>curtir
            </button>
            <button className='flex items-center gap-1' 
                onClick={()=>document.getElementById(`coment ${id}`)?.focus()}>
                <FaRegComment /> Comentar
            </button>
          </div>
          
          { showComent && comentQuery.data?.map((coment)=>{
             return coment && coment.id ? <Coment coment={coment} key={coment.id}/> : null
            })}

          <div className='flex gap-4 pt-6'>
          {user?.userimg ? <Image
          src={ user?.userimg.includes('http') ? user.userimg 
          : `https://api-redes-sociais.onrender.com/uploads/${user.userimg}`  } 
            alt="Imagem do perfil" className='w-8 h-8 rounded-full' width={32}
            quality={100} 
            unoptimized={true}
            height={32}/> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className='w-8 h-8 rounded-full' width={32} height={32} quality={100} unoptimized={true}/>}

          <div className='w-full bg-zinc-100 flex items-center text-gray-600 px-3 py-1 rounded-full'>
            <input
            id={`coment ${id}`}
            value={coment_desc} 
            onChange={(e) => setComent_desc(e.target.value)} 
            placeholder='Comente...'
            type="text" className='bg-zinc-100 w-full focus-visible:outline-none ' />
            <button onClick={()=> shareComent()}>
            <FaPaperPlane/>
            </button>
            
          </div>
          </div>
    </div>
  );
}

export default Post