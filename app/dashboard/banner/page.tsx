'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import getFullUrl from '@/app/utils/getFullUrl';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Banner {
  id: number;
  title: string;
  image: string;
  link: string;
}

export default function Tag() {
  const [error, setError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [file, setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.FormEvent) => {
    const files = (e.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const { setBreadcrumb } = useBreadcrumb();

  const fetchData = async () => {
    const response = await ApiService.get('banner');

    if (response.isSuccess) {
      setBanners(response.data.data);
    } else {
      setTableError(response.message || 'An error occurred.');
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
      setError('Please select a file to upload');
      setIsLoading(false);
      return;
    }

    const response = await ApiService.post('banner', formData);

    if (response.isSuccess) {
      toast.success('Banner added successfully');
      formRef.current?.reset();
      fetchData();
    } else {
      setError(response.message || 'An error occurred.');
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this banner?'
    );

    if (!confirmDelete) return;

    const response = await ApiService.delete(`banner/${id}`);

    if (response.isSuccess) {
      toast.success('Banner deleted successfully');
      fetchData();
    } else {
      toast.error(response.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    fetchData();

    setBreadcrumb([
      { label: 'Home', href: '/dashboard' },
      { label: 'Banners' }
    ]);
  }, [setBreadcrumb]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Banners</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Add new banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}

            <div className="grid gap-2 mb-4">
              <Label htmlFor="title">Title</Label>
              <Input id="title" type="text" name="title" required />
            </div>

            <div className="grid gap-2 mb-4">
              <Label htmlFor="link">Link</Label>
              <Input id="link" type="text" name="link" required />
            </div>

            <div className="grid gap-2 mb-4">
              <Label htmlFor="files">File</Label>

              <Input
                id="files"
                type="file"
                name="files"
                onChange={e => handleFileChange(e)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Add Banner'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <div className="flex flex-wrap gap-2">
            {banners.length > 0 &&
              banners.map(banner => (
                <div
                  key={banner.id}
                  className="grid grid-cols-5 gap-1 bg-gray-200 px-3 py-4 rounded-lg flex-[1 0 300px]"
                >
                  <Image
                    src={getFullUrl(banner.image)}
                    alt={banner.title}
                    width={500}
                    height={500}
                    className="col-span-5 w-full object-cover mb-2"
                  />

                  <p className="col-span-3">{banner.title}</p>

                  <Button
                    className="col-span-1"
                    onClick={() => {
                      router.push(`/dashboard/banner/${banner.id}`);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    className="col-span-1"
                    onClick={() => handleDelete(banner.id)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
