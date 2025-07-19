'use client';

import { Suspense } from 'react';
import EditProfiles from '@/components/EditProfiles';

const EditProfilePage = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditProfiles />
    </Suspense>
  );
};

export default EditProfilePage;
