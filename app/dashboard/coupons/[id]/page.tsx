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
import { Textarea } from '@/components/ui/textarea';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountPercentage: number;
  threshold: number;
  maxDiscount?: number | null;
  expires: string;
}
export default function ProductCategories() {
  const [coupon, setcoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.get(`coupons/${id}`);

      if (response.isSuccess) {
        setcoupon(response.data.data as Coupon);
      } else {
        setError(response.message || 'An unexpected error occurred.');
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await ApiService.patch(`coupons/${id}`, e.currentTarget);
    if (response.isSuccess) {
      toast.success('Category edited successfully.');
      setError(null);
      setcoupon(response.data.data as Coupon);
    } else {
      setError(response.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Coupon</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Edit Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          {coupon && (
            <form ref={formRef} onSubmit={handleSubmit}>
              {error && <AlertDestructive message={error} />}

              <div className="grid gap-2 mb-4">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  type="text"
                  name="code"
                  value={coupon.code}
                  onChange={e => setcoupon({ ...coupon, code: e.target.value })}
                  required
                />
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
                  value={coupon.discountPercentage}
                  onChange={e =>
                    setcoupon({
                      ...coupon,
                      discountPercentage: +e.target.value
                    })
                  }
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
                  value={coupon.threshold}
                  onChange={e =>
                    setcoupon({ ...coupon, threshold: +e.target.value })
                  }
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
                  value={coupon?.maxDiscount ? +coupon.maxDiscount : ''}
                  onChange={e =>
                    setcoupon({
                      ...coupon,
                      maxDiscount: e.target.value ? +e.target.value : null
                    })
                  }
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="expires">Expires</Label>
                {/* expires: 2025-03-29T00:00:00.000Z but the value=2025-03-29 */}
                <Input
                  id="expires"
                  type="date"
                  name="expires"
                  value={coupon.expires.split('T')[0]}
                  onChange={e =>
                    setcoupon({ ...coupon, expires: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={coupon.description}
                  onChange={e =>
                    setcoupon({ ...coupon, description: e.target.value })
                  }
                >
                  {coupon.description}
                </Textarea>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Edit Coupon'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
