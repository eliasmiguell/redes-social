export interface IFriendship{
  id:number,
  follower_id:number,
  followed_id:number,
  status: 'pending' | 'accepted' | 'rejected',
  created_at:string,
  username:string,
  userimg:string
}
export interface IPost {
  id:number,
  post_desc: string,
  img: string,
  username: string,
  userimg: string,
  created_at: string,
  userid: number
}

export interface IComents {
  id:number,
  coment_desc: string,
  userimg:string,
  username:string,
  postid:number,
  created_at: string
}

export interface ILikes {
  id:number,
  likes_userid: number,
  username:string,
  likes_postid:number,
}

export interface IUser{
  id:number,
  username:string,
  userimg:string
}

export interface INotification{
  id:number,
  user_id: number,
  from_user_id: number,
  from_username: string,
  from_userimg: string,
  notification_type: string,
  reference_id?: number,
  message: string,
  is_read: boolean,
  created_at: string
}

 export interface IChat{
  id:number,
  other_username: string;
  other_userimg: string;
  other_user_id: number; // ID do outro usuário na conversa
 }


 export interface IMessage{
  id:number,
  username: string,
  userimg:string,
  messages:string,
  sent_at:number, // Timestamp em segundos desde epoch
  is_read:boolean
  sender_id:number,
  recipient_id:number
 }

 

 export interface IConversatio{
  id:number,
  user1_id: number,
  user2_id:number,
  conversations:number
 }

 export interface IFriend{
  id: number,
  follower_id:number,
  followed_id:number,
 }

// Função utilitária para garantir que nunca passemos string vazia para o componente Image
export const getValidImageUrl = (img?: string | null): string => {
  if (!img || img.trim() === '') {
    return 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }
  return img;
};