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

interface Category {
  id: number;
  name: string;
  slug: string;
}

const columns: { key: keyof Category; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true }
];

export default function ProductCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('product-category');
    if (response.isSuccess) {
      setCategories(response.data.data);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await ApiService.post('product-category', e.currentTarget);
    if (response.isSuccess) {
      toast.success('Category added successfully.');
      if (formRef.current) formRef.current.reset();
      setCategories([...categories, response.data.data]);
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
            <div className="grid gap-2 mb-4">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" name="name" required />
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
            data={categories}
            onEdit={categories =>
              router.push(`/dashboard/product-categories/${categories.slug}`)
            }
            onDelete={categories => handleDelete(categories)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
