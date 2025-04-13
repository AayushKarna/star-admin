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
import { Checkbox } from '@/components/ui/checkbox';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  stock: number;
  slug: string;
  image: string[];
}

interface FlashSale {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscount?: number | null;
  expires: string;
  products: { productId: number }[];
}

export default function EditFlashSale() {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { id } = useParams();

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flashSaleRes, productsRes] = await Promise.all([
          ApiService.get(`flash-sales/${id}`),
          ApiService.get('products')
        ]);

        if (flashSaleRes.isSuccess && productsRes.isSuccess) {
          setFlashSale(flashSaleRes.data.data);
          setProducts(productsRes.data.data);
          setFilteredProducts(productsRes.data.data);
        } else {
          setError(flashSaleRes.message || 'Error fetching data');
        }
      } catch {
        setError('Failed to fetch data');
      }
    };

    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Flash Sales', href: '/dashboard/flash-sales' },
      { label: 'Edit Flash Sale' }
    ]);
  }, [id, setBreadcrumb]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (!value) return setFilteredProducts(products);
    setFilteredProducts(
      products.filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleCheckboxChange = (productId: number) => {
    if (!flashSale) return;

    const isSelected = flashSale.products.some(p => p.productId === productId);

    const updatedProducts = isSelected
      ? flashSale.products.filter(p => p.productId !== productId)
      : [...flashSale.products, { productId }];

    setFlashSale({ ...flashSale, products: updatedProducts });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!flashSale) return;

      const formData = new FormData(e.currentTarget);
      if (!formData.get('maxDiscount')) {
        formData.delete('maxDiscount');
      }

      const products = flashSale.products.map(p => p.productId);
      formData.delete('products[]');
      formData.append('productIds', JSON.stringify(products));

      const response = await ApiService.patch(`flash-sales/${id}`, formData);
      if (response.isSuccess) {
        toast.success('Flash Sale updated successfully.');
        setFlashSale(response.data.data);
        setError(null);
      } else {
        setError(response.message || 'Update failed.');
      }
    } catch {
      setError('Unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Flash Sale</h1>
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Edit Flash Sale</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <AlertDestructive message={error} />}
          {flashSale && (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 mt-4"
            >
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={flashSale.title}
                  onChange={e =>
                    setFlashSale({ ...flashSale, title: e.target.value })
                  }
                  required
                />

                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={flashSale.description}
                  onChange={e =>
                    setFlashSale({ ...flashSale, description: e.target.value })
                  }
                  required
                />

                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  name="discountPercentage"
                  value={flashSale.discountPercentage}
                  onChange={e =>
                    setFlashSale({
                      ...flashSale,
                      discountPercentage: Number(e.target.value)
                    })
                  }
                  required
                />

                <Label htmlFor="maxDiscount">Max Discount</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min={0}
                  step={0.01}
                  name="maxDiscount"
                  value={flashSale.maxDiscount ?? ''}
                  onChange={e =>
                    setFlashSale({
                      ...flashSale,
                      maxDiscount: e.target.value
                        ? Number(e.target.value)
                        : null
                    })
                  }
                />

                <Label htmlFor="expires">Expires</Label>
                <Input
                  id="expires"
                  type="date"
                  name="expires"
                  value={flashSale.expires.split('T')[0]}
                  onChange={e =>
                    setFlashSale({ ...flashSale, expires: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <p className="mb-3">Products in Sale</p>
                <Input
                  type="text"
                  placeholder="Search products"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="mb-4"
                />
                <div className="max-h-96 overflow-y-auto px-2 py-4 border border-gray-200 rounded-md grid gap-2">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={flashSale.products.some(
                          p => p.productId === product.id
                        )}
                        onCheckedChange={() => handleCheckboxChange(product.id)}
                      />
                      <Label htmlFor={`product-${product.id}`}>
                        {product.name} - Rs.{' '}
                        {Intl.NumberFormat('en-us').format(
                          product.sellingPrice
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Sale'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
