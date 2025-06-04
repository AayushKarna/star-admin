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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName?: string; // manually added for UI
  subCategories?: Category[]; // optional for incoming server data
  icon?: string;
}

const columns: {
  key: keyof Category | 'parentName';
  label: string;
  sortable: boolean;
}[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'parentName', label: 'Parent Category', sortable: false }
];

export default function ProductCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('product-category');
    if (response.isSuccess) {
      const flatCategories: Category[] = [];

      response.data.data.forEach(
        (category: Category & { subCategories?: Category[] }) => {
          flatCategories.push({
            id: category.id,
            name: category.name,
            slug: category.slug,
            parentId: category.parentId
          });

          if (category.subCategories && category.subCategories.length > 0) {
            category.subCategories.forEach((sub: Category) => {
              flatCategories.push({
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                parentId: sub.parentId
              });
            });
          }
        }
      );

      setCategories(flatCategories);
    } else {
      setTableError(response.message || 'An error occurred.');
    }
  };

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    fetchData();
    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Product Categories' }
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

    const formData = new FormData(e.currentTarget);

    if (file) {
      const uploadResponse = await ApiService.uploadFile(file);
      if (!uploadResponse.isSuccess) {
        setError(uploadResponse.message || 'File upload failed.');
        setIsLoading(false);
        return;
      }

      formData.set('icon', uploadResponse.data.fileUrls[0]);
    } else {
      formData.delete('icon');
    }

    const parentId = formData.get('parentId');
    if (parentId === '-1') formData.set('parentId', '');

    const response = await ApiService.post('product-category', formData);
    if (response.isSuccess) {
      toast.success('Category added successfully.');
      if (formRef.current) formRef.current.reset();
      fetchData(); // Refresh with parentName
      setError(null);
    } else {
      setError(response.message || 'An error occurred.');
    }

    setIsLoading(false);
  };

  const handleDelete = async (category: Category) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this category?'
    );
    if (!confirmDelete) return;

    const response = await ApiService.delete(
      `product-category/${category.slug}`
    );
    if (response.isSuccess) {
      setCategories(categories.filter(c => c.id !== category.id));
      toast.success('Category deleted successfully.');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Categories</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Add new category</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}
            <div className="grid gap-2 mb-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" name="name" required />
            </div>

            <div className="grid gap-2 mb-4">
              <Label htmlFor="files">Icon</Label>
              <Input
                id="files"
                type="file"
                name="files"
                onChange={e => handleFileChange(e)}
              />
            </div>

            <div className="grid gap-2 mb-4">
              <Label htmlFor="parentId">Parent Category</Label>
              <Select name="parentId" required>
                <SelectTrigger className="w-full" id="parentId">
                  <SelectValue placeholder="Select Parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">Null</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={`${category.id}`}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={categories.map(cat => {
              const parent = categories.find(c => c.id === cat.parentId);
              return {
                ...cat,
                parentName: parent ? parent.name : '—'
              };
            })}
            onEdit={category =>
              router.push(`/dashboard/product-categories/${category.slug}`)
            }
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
