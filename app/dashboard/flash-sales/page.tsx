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
  products: {
    product: Product[];
  }[];
}

const columns: { key: keyof FlashSale; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'discountPercentage', label: 'Discount %', sortable: true },
  {
    key: 'maxDiscount',
    label: 'Max Discount',
    sortable: true,
    render: (row: FlashSale) =>
      Number(row.maxDiscount)
        ? `Rs. ${Intl.NumberFormat('en-us').format(row.maxDiscount)}`
        : 'N/A'
  },
  {
    key: 'expires',
    label: 'Expires',
    sortable: true,
    render: (row: FlashSale) =>
      new Date(row.expires).toISOString().split('T')[0]
  }
];

export default function ProductCategories() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const fetchData = async () => {
    const [response, productResponse] = await Promise.all([
      ApiService.get('flash-sales'),
      ApiService.get('products')
    ]);

    if (!response.isSuccess) {
      setTableError(response.message || 'An error occurred.');
    }
    setFlashSales(response.data.data);
    setProducts(productResponse.data.data);
    setFilteredProducts(productResponse.data.data);
  };

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Flash Sales' }
    ]);
  }, [setBreadcrumb]);

  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value) return setFilteredProducts([...products]);

    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredProducts(filtered);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    if (!formData.get('maxDiscount')) {
      formData.delete('maxDiscount');
    }

    console.log('Products: ', formData.getAll('products[]'));
    const products = formData.getAll('products[]');
    formData.delete('products[]');
    formData.append('productIds', JSON.stringify(products));

    const response = await ApiService.post('flash-sales', formData);

    if (response.isSuccess) {
      toast.success('Flash Sale created successfully.');
      if (formRef.current) formRef.current.reset();
      const formattedSale = {
        ...response.data.data,
        products: products.filter(p =>
          response.data.data.products.includes(p.id)
        )
      };
      setFlashSales([...flashSales, formattedSale]);
      setError(null);
    } else {
      setError(response.message || 'An error occurred.');
    }

    setIsLoading(false);
  };

  const handleDelete = async (flashSale: FlashSale) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this Flash Sale?'
    );

    if (!confirmDelete) return;

    const response = await ApiService.delete(`flash-sales/${flashSale.id}`);
    if (response.isSuccess) {
      setFlashSales(flashSales.filter(c => c.id !== flashSale.id));
      toast.success('Flash Sale deleted successfully.');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Flash Sales</h1>

      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Add new sale</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <AlertDestructive message={error} />}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4 mt-4"
          >
            <div>
              <div className="grid gap-2 mb-4">
                <Label htmlFor="title">Title</Label>
                <Input id="title" type="text" name="title" required />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  name="description"
                  required
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  name="discountPercentage"
                  required
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="maxDiscount">Max Discount</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min={0}
                  step={0.01}
                  name="maxDiscount"
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="expires">Expires</Label>
                <Input id="expires" type="date" name="expires" required />
              </div>
            </div>

            <div>
              <p className="mb-3">Products in Sale</p>

              <div className="max-h-96 overflow-y-auto px-2 py-4 border border-gray-200 rounded-md grid gap-2">
                <Input
                  type="text"
                  placeholder="Search products"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="mb-4"
                />
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`product-${product.id}`}
                      name="products[]"
                      value={product.id}
                    />
                    <Label htmlFor={`product-${product.id}`}>
                      {product.name} - Rs.{' '}
                      {Intl.NumberFormat('en-us').format(product.sellingPrice)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Create Sale'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={flashSales}
            onEdit={flashSale =>
              router.push(`/dashboard/flash-sales/${flashSale.id}`)
            }
            onDelete={flashSale => handleDelete(flashSale)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
