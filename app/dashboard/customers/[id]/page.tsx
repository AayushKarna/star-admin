'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import ApiService from '@/app/utils/apiService';
import { useParams } from 'next/navigation';
import { AlertDestructive } from '@/components/alert-destructive';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string; //2025-03-14T07:04:39.370Zs
}

export default function ProductCategories() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.get(`users/${id}`);

      if (response.isSuccess) {
        setCustomer(response.data.data as Customer);
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Customers', href: '/dashboard/customers' },
      { label: `Customer ${id}` }
    ]);
  }, [id, setBreadcrumb]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Customer Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <AlertDestructive message={error} />}
          {customer && (
            <div className="flex flex-col gap-2">
              <p>
                <strong>First Name: </strong> {customer.firstName}
              </p>

              <p>
                <strong>Last Name: </strong> {customer.lastName}
              </p>

              <p>
                <strong>Email: </strong> {customer.email}
              </p>

              <p>
                <strong>Phone: </strong> {customer.phone}
              </p>

              <p>
                <strong>Created At: </strong>{' '}
                {new Date(customer.createdAt)
                  .toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })
                  .replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
