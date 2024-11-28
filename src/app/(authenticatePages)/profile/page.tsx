'use client';

import { Suspense } from 'react';  
import Profile from '@/components/Profile';

const ProfilePage = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Profile/>
    </Suspense>
  );
};

export default ProfilePage;
