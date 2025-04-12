'use client';

import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { DataTable } from '@/components/data-table';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useRouter } from 'next/navigation';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Brand {
  id: number;
  name: string;
  logo: string | null;
  slug: string;
  priority: number;
}

const columns: { key: keyof Brand; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  {
    key: 'priority',
    label: 'Priority',
    sortable: true,
    render: (row: Brand) => row.priority || 'Default'
  }
];

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('brands');
    if (response.isSuccess) {
      setBrands(response.data.data);
    } else {
      setTableError(response.message || 'An error occurred.');
    }
  };

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Brands' }
    ]);
  }, [setBreadcrumb]);

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
    const formData = new FormData(formRef.current || undefined);

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

    const response = await ApiService.post('brands', formData);
    if (response.isSuccess) {
      toast.success('Brand added successfully.');
      formRef.current?.reset();
      setBrands([...brands, response.data.data]);
    } else {
      setError(response.message || 'Failed to add brand.');
    }

    setIsLoading(false);
  };

  const handleDelete = async (brand: Brand) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this brand?'
    );

    if (!confirmDelete) return;

    const response = await ApiService.delete(`brands/${brand.slug}`);
    if (response.isSuccess) {
      setBrands(brands.filter(b => b.id !== brand.id));
      toast.success('Brand deleted successfully.');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Brands</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Add new brand</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" name="name" required />
            </div>

            {/* priority */}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="priority">Priority (optional)</Label>
              <Input
                id="priority"
                type="number"
                name="priority"
                min={0}
                step={1}
              />
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
              {isLoading ? 'Loading...' : 'Add Brand'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Brands</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={brands}
            onEdit={brand => router.push(`/dashboard/brands/${brand.slug}`)}
            onDelete={brand => handleDelete(brand)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
