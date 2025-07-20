'use client';

import { UserContext } from '@/context/UserContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { FaUserFriends, FaPaperPlane } from 'react-icons/fa';
import { TbPhoto } from 'react-icons/tb';
import { makeRequest } from '../../axios';
import Image from 'next/image';
// Criar posts
function Share() {
  const { user } = useContext(UserContext);
  const [post_desc, setDesc] = useState('');
  const [postImg, setPostImg] = useState('');
  const [img, setImg] = useState<File | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (img) {
      return setPostImg(URL.createObjectURL(img));
    }
  }, [img]);

  const mutation = useMutation({
    mutationFn: async (newPost: { post_desc: string, img: string, userid: number }) => {
      await makeRequest.post('post/', newPost).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Carregar imagem do post
  const upload = async () => {
    try {
      const formData = new FormData();
      if(img ){
        formData.append('file', img);
        const res = await makeRequest.post('upload/', formData);
        return res.data;
      }
     
    } catch (error) {
      console.log(error);
    }
  };

  const sharePost = async () => {
    let imgUrl = '';
    if (img) {
      imgUrl = await upload();
    }
    mutation.mutate({ post_desc, img: imgUrl, userid: Number(user?.id) });
    setDesc('');
    setImg(null);
  };

  return (
    <div className='w-full p-6 flex flex-col gap-4'>
      {/* Preview da imagem */}
      {img && (
        <div className="relative">
          {postImg ? <Image 
            className='rounded-xl w-full max-h-64 object-cover' 
            src={postImg.includes('http') ? postImg : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${postImg}`} 
            alt='imagem posts'
            width={400}
            height={200} 
            quality={100} 
            unoptimized={true}
          /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-full max-h-64 object-cover" width={400} height={200} quality={100} unoptimized={true}/>}
          <button 
            onClick={() => setImg(null)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
            
      <div className='flex items-center gap-4'>
       {user?.userimg ? <Image
          src={user?.userimg.includes('http') ? user?.userimg : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${user?.userimg}`}
          alt="Imagem do perfil"
          className='w-12 h-12 rounded-full border-2 border-white shadow-sm'
          width={48}
          height={48}
          quality={100} 
          unoptimized={true}
        /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" width={48} height={48} quality={100} unoptimized={true}/>}
        <div className='flex-1'>
          <h3 className="font-semibold text-gray-800 mb-1">Criar Post</h3>
          <div className='bg-white border border-gray-200 rounded-full flex items-center px-4 py-3 shadow-sm'>
            <input
              onChange={(e) => setDesc(e.target.value)}
              value={post_desc}
              placeholder={`No que você está pensando ${user?.username}?`}
              type="text"
              className='flex-1 bg-transparent focus:outline-none text-gray-700'
            />
            <button 
              onClick={() => sharePost()}
              disabled={!post_desc.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              <FaPaperPlane className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className='flex justify-around py-4 text-gray-600 border-t border-gray-200'>
        <input
          className="hidden"
          type="file"
          id="img"
          onChange={(e) => e.target.files && setImg(e.target.files[0])}
        />
        <label htmlFor='img' className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
          <TbPhoto className='text-xl text-blue-600' />
          <span className="font-medium">Adicionar Imagem</span>
        </label>
        <button className='flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all'>
          <FaUserFriends className='text-xl text-purple-600' />
          <span className="font-medium">Marcar Amigo</span>
        </button>
      </div>
    </div>
  );
}

export default Share;
