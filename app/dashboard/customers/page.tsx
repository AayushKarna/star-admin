'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { DataTable } from '@/components/data-table';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useRouter } from 'next/navigation';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string; //2025-03-14T07:04:39.370Zs
}

const columns: { key: keyof Customer; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'firstName', label: 'First Name', sortable: true },
  { key: 'lastName', label: 'Last Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true }
];

export default function Tag() {
  const [tableError, setTableError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('users');

    if (response.isSuccess) {
      setCustomers(response.data.data);
    } else {
      setTableError(response.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={customers}
            onView={customer =>
              router.push(`/dashboard/customers/${customer.id}`)
            }
            onOrderHistory={customer => {
              toast('Order history clicked for customer ID: ' + customer.id);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
