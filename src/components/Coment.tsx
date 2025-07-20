import moment from 'moment';
import "moment/locale/pt-br";
import Image from 'next/image';
import { IComents } from '@/interface';

function Coment(props:{coment : IComents}) {

  const {coment_desc, userimg, username, created_at} = props.coment
  return(
    <div className='mt-6 flex gap-2'>
      {userimg ? <Image
           src={userimg.includes('http') ? userimg : `https://api-redes-sociais.onrender.com/uploads/${userimg}`}
            alt="imagem do perfil " 
            className='w-8 h-8 rounded-full' width={32}
            height={32}
            quality={100} 
            unoptimized={true}
            /> : <Image src={"https://img.freepik.com/free-icon/user_318-159711.jpg"} alt="Imagem do perfil" className="w-8 h-8 rounded-full" width={32} height={32} quality={100} unoptimized={true}/>}
      <div className='text-zinc-600 w-full'>
        <div className='flex flex-col bg-zinc-100 px-4 py-1 rounded-md'>
          <span className='font-semibold'>{username}</span>
          <span>{coment_desc}</span>
        </div>
        <span className='text-xs'>{moment(created_at).local().fromNow()}</span>
      </div>
    </div>
  );
}

export default Coment;