'use client';

import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useParams, useRouter } from 'next/navigation';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function ProductCategories() {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const { slug } = useParams();

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.get(`tags/${slug}`);

      if (response.isSuccess) {
        setName((response.data.data as Tag)?.name || '');
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Tags', href: '/dashboard/tags' },
      { label: 'Edit Tag' }
    ]);
  }, [slug, setBreadcrumb]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await ApiService.patch(`tags/${slug}`, e.currentTarget);
    if (response.isSuccess) {
      toast.success('Tag edited successfully.');
      if (formRef.current) formRef.current.reset();
      router.push(`/dashboard/tags/${response.data.data.slug}`);
    } else {
      setError(response.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Tag</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Edit Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Edit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
