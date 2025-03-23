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

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountPercentage: number;
  threshold: number;
  maxDiscount?: number | null;
  expires: string;
}

const columns: { key: keyof Coupon; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'code', label: 'Code', sortable: true },
  { key: 'discountPercentage', label: 'Discount %', sortable: true },
  {
    key: 'threshold',
    label: 'Threshold',
    sortable: true,
    render: (row: Coupon) =>
      `Rs. ${Intl.NumberFormat('en-us').format(row.threshold)}`
  },
  {
    key: 'maxDiscount',
    label: 'Max Discount',
    sortable: true,
    render: (row: Coupon) =>
      Number(row.maxDiscount)
        ? `Rs. ${Intl.NumberFormat('en-us').format(row.maxDiscount)}`
        : 'N/A'
  },
  {
    key: 'expires',
    label: 'Expires',
    sortable: true,
    render: (row: Coupon) => new Date(row.expires).toISOString().split('T')[0]
  }
];

export default function ProductCategories() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('coupons');

    if (response.isSuccess) {
      setCoupons(response.data.data);
    } else {
      setTableError(response.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    if (!formData.get('maxDiscount')) {
      formData.delete('maxDiscount');
    }

    const response = await ApiService.post('coupons', formData);

    if (response.isSuccess) {
      toast.success('Coupon created successfully.');
      if (formRef.current) formRef.current.reset();
      setCoupons([...coupons, response.data.data]);
      setError(null);
    } else {
      setError(response.message || 'An error occurred.');
    }

    setIsLoading(false);
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this Coupon?'
    );

    if (!confirmDelete) return;

    const response = await ApiService.delete(`coupons/${coupon.id}`);
    if (response.isSuccess) {
      setCoupons(coupons.filter(c => c.id !== coupon.id));
      toast.success('Coupon deleted successfully.');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Coupons</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Add new coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="code">Code</Label>
              <Input id="code" type="text" name="code" required />
            </div>

            <div className="grid gap-2 mb-4">
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <Input
                id="discountPercentage"
                type="number"
                min={1}
                max={100}
                step={0.01}
                name="discountPercentage"
                required
              />
            </div>

            <div className="grid gap-2 mb-4">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min={1}
                step={0.01}
                name="threshold"
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

            <div className="grid gap-2 mb-4">
              <Label htmlFor="description">Description</Label>
              <Input id="description" type="text" name="description" />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Create Coupon'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={coupons}
            onEdit={coupon => router.push(`/dashboard/coupons/${coupon.id}`)}
            onDelete={coupon => handleDelete(coupon)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
