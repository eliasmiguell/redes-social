'use client';
import FriendshipTable from '@/components/FriendshipTable';
import { FaUserFriends } from 'react-icons/fa';

function Followed() {
  return (
    <div className="w-full h-full p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full">
        {/* Header da página */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FaUserFriends className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Seguidores</h1>
          </div>
          <p className="text-gray-600">Gerencie suas conexões e descubra novos amigos</p>
        </div>

        {/* Conteúdo principal */}
        <div className="p-6 h-full overflow-y-auto">
          <FriendshipTable/>
        </div>
      </div>
    </div>
  );
}

export default Followed;