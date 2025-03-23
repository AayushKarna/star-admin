'use client';

import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import getFullUrl from '@/app/utils/getFullUrl';

interface Brand {
  id: number;
  name: string;
  logo: string | null;
  slug: string;
}

export default function ProductCategories() {
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const formRef = useRef<HTMLFormElement>(null);

  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.get(`brands/${slug}`);

      if (response.isSuccess) {
        setBrand((response.data.data as Brand) || null);
        setName(response.data.data.name);
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(formRef.current || undefined);

    console.log(file);

    if (file) {
      const uploadResponse = await ApiService.uploadFile(file);
      if (!uploadResponse.isSuccess) {
        setError(uploadResponse.message || 'File upload failed.');
        setIsLoading(false);
        return;
      }

      formData.set('logo', uploadResponse.data.fileUrls[0]);
    } else {
      formData.delete('logo');
    }

    const response = await ApiService.patch(`brands/${slug}`, formData);
    if (response.isSuccess) {
      toast.success('Brand edited successfully.');
      formRef.current?.reset();
      window.location.href = `/dashboard/brands/${response.data.data.slug}`;
    } else {
      setError(response.message || 'Failed to add brand.');
    }

    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Brands</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Edit Brand</CardTitle>
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
            <div className="grid gap-2 mb-4">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                name="logo"
                onChange={e => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) setFile(files[0]);
                }}
                className="mb-4"
              />

              <div className="bg-gray-100 p-4 relative">
                {brand?.logo ? (
                  <>
                    <Image
                      src={getFullUrl(brand.logo)}
                      alt="Brand Logo"
                      width={300}
                      height={300}
                      style={{
                        objectFit: 'contain',
                        height: '100px',
                        width: 'auto'
                      }}
                    />
                  </>
                ) : (
                  <p>❌ No Image </p>
                )}
              </div>
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
