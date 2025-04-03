'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import ApiService from '@/app/utils/apiService';
import { useParams } from 'next/navigation';
import { AlertDestructive } from '@/components/alert-destructive';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Label } from '@radix-ui/react-label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  shippingCharge: number; // Shipping charge included in the totalPrice
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

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string; //2025-03-14T07:04:39.370Zs
}

export default function ProductCategories() {
  const [order, setOrder] = useState<FormattedOrderResponse | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [paymentStatus, setPaymentStatus] = useState<string>('PAID');
  const [loading, setLoading] = useState<boolean>(false);

  const { id } = useParams();

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.get(`orders/${id}`);

      const user = await ApiService.get(`users/${response.data.order.userId}`);

      if (response.isSuccess) {
        setOrder(response.data.order);
        setCustomer(user.data.data);
        setStatus(response.data.order.status as OrderStatus);
        setPaymentStatus(response.data.order.isPaid ? 'PAID' : 'UNPAID');
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Orders', href: '/dashboard/orders' },
      { label: `Order # ${id}` }
    ]);
  }, [id, setBreadcrumb]);

  async function handleStatusChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatusError(null);

    const response = await ApiService.patch(`orders/${id}`, {
      status: status,
      isPaid: paymentStatus === 'PAID' ? true : false
    });

    if (response.isSuccess) {
      setStatusError(null);
      setOrder(prev => ({
        ...prev!,
        status: status,
        isPaid: paymentStatus === 'PAID' ? true : false
      }));

      toast.success('Order status updated successfully!');

      setLoading(false);
    } else {
      setStatusError('An unexpected error occurred.');

      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Order #{id}</h1>

      <div className="flex gap-4">
        <Card className="w-full max-w-md mb-6">
          <CardHeader>
            <CardTitle>Order Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <AlertDestructive message={error} />}
            {order && (
              <div className="flex flex-col gap-2">
                <p>
                  <strong>Order Id: </strong> {order.orderId}
                </p>

                <p>
                  <strong>Payment Method: </strong>{' '}
                  {order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                    ? '💵 Cash on Delivery'
                    : '🌐 Khalti'}
                </p>

                <p>
                  <strong>Status: </strong>{' '}
                  <span
                    className={`status status-${order.status.toLocaleLowerCase()}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </p>

                <p>
                  <strong>Is Paid: </strong> {order.isPaid ? '✅ Yes' : '❌ No'}
                </p>

                <p>
                  <strong>Total Price: </strong> Rs.{' '}
                  {Intl.NumberFormat('en-us').format(order.totalPrice)}
                </p>

                <p>
                  <strong>Created At: </strong>{' '}
                  {new Date(order.createdAt)
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

        <Card className="w-full max-w-sm mb-6">
          <CardHeader>
            <CardTitle>Shipping Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <AlertDestructive message={error} />}
            {order && (
              <div className="flex flex-col gap-2">
                <p>
                  <strong>Full Name: </strong> {order.shippingFullName}
                </p>

                <p>
                  <strong>Email: </strong> {order.shippingEmail}
                </p>

                <p>
                  <strong>Phone: </strong> {order.shippingPhone}
                </p>

                <p>
                  <strong>Address: </strong> {order.shippingAddress}
                </p>

                <p>
                  <strong>Created At: </strong>{' '}
                  {new Date(order.createdAt)
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

      <div className="flex gap-4 items-start">
        <Card className="w-full max-w-xl mb-6">
          <CardHeader>
            <CardTitle>Cart Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <AlertDestructive message={error} />}
            {order && (
              <div className="flex flex-col gap-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          Rs.{' '}
                          {Intl.NumberFormat('en-us').format(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell>
                        Rs. {Intl.NumberFormat('en-us').format(order.subTotal)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}>Discount</TableCell>
                      <TableCell>
                        {order.couponDiscount > 0
                          ? `Rs. ${Intl.NumberFormat('en-us').format(
                              order.couponDiscount
                            )}`
                          : '---'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}>Shipping Charge</TableCell>
                      <TableCell>
                        {order.shippingCharge === 0
                          ? 'Free'
                          : `Rs. ${Intl.NumberFormat('en-us').format(
                              order.shippingCharge
                            )}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}>Grand Total</TableCell>
                      <TableCell>
                        <strong>
                          Rs.{' '}
                          {Intl.NumberFormat('en-us').format(order.totalPrice)}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full max-w-xl mb-6">
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
          </CardHeader>

          <CardContent>
            {statusError && <AlertDestructive message={statusError} />}
            {order && (
              <form className="grid gap-4" onSubmit={handleStatusChange}>
                <div className="grid gap-2">
                  <Label htmlFor="orderStatus">Order Status</Label>
                  <Select
                    name="orderStatus"
                    value={status}
                    onValueChange={value => {
                      setStatus(value as OrderStatus);
                    }}
                    required
                  >
                    <SelectTrigger className="w-full" id="orderStatus">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                      <SelectItem value="DISPATCHED">DISPATCHED</SelectItem>
                      <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    name="paymentStatus"
                    value={paymentStatus}
                    onValueChange={value => {
                      setPaymentStatus(value);
                    }}
                    required
                  >
                    <SelectTrigger className="w-full" id="paymentStatus">
                      <SelectValue placeholder="Select Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">PAID</SelectItem>
                      <SelectItem value="UNPAID">UNPAID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Update Order Status'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
