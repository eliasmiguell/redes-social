'use client';
import Post from './Post';
import { IPost } from '@/interface';




function Feed(props:{post:IPost[]|undefined}) {
  return(
    <div className='w-full'>
      <div className="w-full flex flex-col gap-6">
        {props.post && props.post.length > 0 ? (
          props.post.map((post) => (
            <Post post={post} key={post.id}/>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-500">Seja o primeiro a compartilhar algo incrível!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;