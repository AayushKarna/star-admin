'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { useState, useEffect, useRef } from 'react';
import ApiService from '@/app/utils/apiService';
import { useParams } from 'next/navigation';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import { BASE_URL } from '@/app/constants/constants';

interface Banner {
  id: number;
  title: string;
  image: string;
  link: string;
}

export default function ProductCategories() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const formRef = useRef<HTMLFormElement>(null);

  const { id } = useParams();

  const handleFileChange = (e: React.FormEvent) => {
    const files = (e.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(formRef.current ?? undefined);

    if (file && file.size > 0) {
      const uploadImpageResponse = await ApiService.uploadFile(file);

      console.log(uploadImpageResponse.data.fileUrls);
      if (uploadImpageResponse.isSuccess) {
        formData.set('image', uploadImpageResponse.data.fileUrls[0]);
      } else {
        throw new Error(uploadImpageResponse.message || 'An error occurred.');
      }
    } else {
      formData.delete('image');
    }

    const response = await ApiService.patch(`banner/${id}`, formData);

    if (response.isSuccess) {
      toast.success('Banner edited successfully');
      setBanner(response.data.data as Banner);
      formRef.current?.reset();
    } else {
      setError(response.message || 'An error occurred.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.get(`banner/${id}`);

      if (response.isSuccess) {
        setBanner(response.data.data as Banner);
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();
  }, [id]);

  console.log(banner);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Banner</h1>

      <Card className="w-full max-w-lg mb-6">
        <CardHeader>
          <CardTitle>Edit Banner</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <AlertDestructive message={error} />}
          {banner ? (
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="grid gap-2 mb-4">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  name="title"
                  value={banner.title}
                  onChange={e =>
                    setBanner({ ...banner, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  type="text"
                  name="link"
                  value={banner.link}
                  onChange={e =>
                    setBanner({ ...banner, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="files">File</Label>

                <div className="bg-gray-100 py-2 px-2 rounded-md relative">
                  <Image
                    src={`${BASE_URL}${banner.image}`}
                    alt="Brand Image"
                    width={500}
                    height={500}
                    style={{
                      objectFit: 'cover',
                      height: 'auto',
                      width: '100%'
                    }}
                  />
                </div>

                <Input
                  id="files"
                  type="file"
                  name="files"
                  onChange={e => handleFileChange(e)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Edit Banner'}
              </Button>
            </form>
          ) : (
            <p>Banner</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
