'use client';

import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  const accessToken = Cookies.get('accessToken') || '';

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth');
    }

    const decoded = jwtDecode(accessToken) as {
      email: string;
      exp: number;
      iat: number;
      role: string;
      sub: string; // also user id
    };

    const isExpired = decoded.exp * 1000 < Date.now();
    const isAdmin = decoded.role === 'ADMIN';

    if (isExpired || !isAdmin) {
      router.push('/auth');
    } else {
      router.push('/dashboard');
    }
  }, [accessToken, router]);

  return <p>Redirecting....</p>;
}
