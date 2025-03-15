'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { BASE_URL, TIMEOUT_SEC } from '../app/constants/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Spinner } from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';

import Cookies from 'js-cookie';

interface SuccessResponse {
  status: string;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  accessToken: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { data } = await axios.post<SuccessResponse>(
        `${BASE_URL}/auth/login`,
        e.currentTarget,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(TIMEOUT_SEC * 1000)
        }
      );

      setError(null);

      Cookies.set('accessToken', data.accessToken, {
        secure: true,
        expires: 7
      });

      toast.success('Login successful.', {
        duration: 10 * 1000
      });

      window.location.href = '/';
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
              </div>
              <Button
                type="submit"
                className="w-full flex items-center gap-3 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading && <Spinner size={20} className="animate-spin" />}
                <span>Submit</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
