'use client';

import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useEffect } from 'react';

export default function Home() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([
      { label: 'Home', href: '/dashboard' },
      { label: 'Dashboard' }
    ]);
  }, [setBreadcrumb]);

  return <p>Welcome to dashboard.</p>;
}
