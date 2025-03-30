'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

function Logout() {
  const router = useRouter();

  const accessToken = Cookies.get('accessToken');

  useEffect(() => {
    if (accessToken) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      router.push('/auth');
    } else {
      router.push('/auth');
    }
  }, [accessToken, router]);

  return <div>Logging out...</div>;
}

export default Logout;
