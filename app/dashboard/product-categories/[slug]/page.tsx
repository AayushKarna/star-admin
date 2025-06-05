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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Image from 'next/image';
import getFullUrl from '@/app/utils/getFullUrl';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  icon?: string;
  priority?: number;
}

export default function ProductCategories() {
  // const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();

  const formRef = useRef<HTMLFormElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const router = useRouter();

  const { slug } = useParams();

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    const fetchData = async () => {
      // const response = await ApiService.get(`product-category/${slug}`);
      const [response, categoriesResponse] = await Promise.all([
        ApiService.get(`product-category/${slug}`),
        ApiService.get('product-category')
      ]);

      if (response.isSuccess) {
        // setName((response.data.data as Category)?.name || '');
        setCategory(response.data.data as Category);
        setCategories(categoriesResponse.data.data as Category[]);
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Product Categories', href: '/dashboard/product-categories' },
      { label: 'Edit Category' }
    ]);
  }, [slug, setBreadcrumb]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(formRef.current || undefined);

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

    const response = await ApiService.patch(
      `product-category/${slug}`,
      formData
    );

    if (response.isSuccess) {
      setCategory(response.data.data as Category);
      toast.success('Category edited successfully.');
      if (formRef.current) formRef.current.reset();
      router.push(`/dashboard/product-categories/${response.data.data.slug}`);
    } else {
      setError(response.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Categories</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}
            {category && (
              <>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={category.name}
                    onChange={e =>
                      setCategory({ ...category, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2 mb-4">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    type="file"
                    name="icon"
                    onChange={e => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) setFile(files[0]);
                    }}
                    className="mb-4"
                  />

                  <div className="bg-gray-100 p-4 relative">
                    {category?.icon ? (
                      <>
                        <Image
                          src={getFullUrl(category.icon)}
                          alt="Category Icon"
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

                <div className="grid gap-2 mb-4">
                  <Label htmlFor="parentId">Parent Categoy</Label>
                  <Select
                    name="parentId"
                    value={`${category.parentId ?? -1}`}
                    onValueChange={value =>
                      setCategory({
                        ...category,
                        parentId: value === '-1' ? null : parseInt(value)
                      })
                    }
                    required
                  >
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

                <div className="grid gap-2 mb-4">
                  <Label htmlFor="priority">Priority (optional)</Label>
                  <Input
                    id="priority"
                    type="number"
                    name="priority"
                    value={category.priority || ''}
                    onChange={e =>
                      setCategory({
                        ...category,
                        priority: e.target.value
                          ? parseInt(e.target.value)
                          : undefined
                      })
                    }
                    required={false}
                    min={0}
                    step={1}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Edit'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
