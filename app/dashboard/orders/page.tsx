'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { DataTable } from '@/components/data-table';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useRouter } from 'next/navigation';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  KHALTI = 'KHALTI'
}

enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DISPATCHED = 'DISPATCHED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

interface Coupon {
  id: number;
  code: string;
  discountPercentage: number;
  maxDiscount: number | null;
  threshold: number;
}

interface FormattedOrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null; // Assuming first image or null
  quantity: number;
  rate: number; // Price per item *after* flash sale discount (tax-inclusive)
  totalPrice: number; // rate * quantity (tax-inclusive)
  flashSaleApplied: {
    id: number;
    title: string;
    discountPercentage: number;
    maxDiscount: number | null;
    appliedDiscountAmount: number; // Discount applied to this specific item
  } | null;
}

interface FormattedOrderResponse {
  id: number;
  orderId: string;
  userId: number;
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod; // Use Enum type
  status: OrderStatus; // Use Enum type
  isFulfilled: boolean;
  isPaid: boolean;
  tax: number; // Tax portion included in the totalPrice
  subTotal: number; // Total before coupon, after flash sales (tax-inclusive)
  couponDiscount: number; // Total discount from coupon
  totalPrice: number; // Final price after all discounts (tax-inclusive)
  createdAt: Date;
  updatedAt: Date;
  couponApplied: {
    id: number;
    code: string;
    discountPercentage: number;
    maxDiscount: number | null;
    threshold: number;
  } | null;
  items: FormattedOrderItem[];
}

const columns: {
  key: keyof FormattedOrderResponse;
  label: string;
  sortable: boolean;
}[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'shippingFullName', label: 'First Name', sortable: true },
  { key: 'shippingPhone', label: 'Phone', sortable: true },
  { key: 'shippingAddress', label: 'Address', sortable: true },
  {
    key: 'isPaid',
    label: 'Payment',
    render: (row: FormattedOrderResponse) =>
      row.isPaid ? '✅ Paid' : '❌ Unpaid'
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: FormattedOrderResponse) => (
      <span className={`status status-${row.status.toLowerCase()}`}>
        {row.status}
      </span>
    )
  },
  {
    key: 'createdAt',
    label: 'Created At',
    sortable: true,
    render: (row: FormattedOrderResponse) => `${row.createdAt.split('T')[0]}`
  }
];

export default function Tag() {
  const [tableError, setTableError] = useState<string | null>(null);
  const [orders, setOrders] = useState<FormattedOrderResponse[]>([]);

  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('orders');

    if (response.isSuccess) {
      setOrders(response.data.orders || []);
    } else {
      setTableError(response.message || 'An error occurred.');
    }
  };

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Orders' }
    ]);
  }, [setBreadcrumb]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={orders}
            onView={order => router.push(`/dashboard/orders/${order.orderId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
