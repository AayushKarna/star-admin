'use client';

import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useRouter } from 'next/navigation';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Setting {
  id: number;
  key: string;
  value: string;
}

export default function ProductCategories() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const fetchData = async () => {
    const response = await ApiService.get('settings');

    if (response.isSuccess) {
      setSettings(response.data.data);
    } else {
      setError(response.message || 'An error occurred.');
    }
  };

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // data should be array of objects with key and value no id

    // const response = await ApiService.patch('settings', [settings.map(setting =>  })]);
    const data = Array.from(formRef.current?.elements ?? []).reduce<
      { key: string; value: string }[]
    >((acc, element) => {
      if (element instanceof HTMLInputElement && element.name) {
        acc.push({
          key: element.name,
          value: element.value
        });
      }
      return acc;
    }, []);

    const response = await ApiService.patch('settings', { settings: data });

    console.log(response);

    if (response.isSuccess) {
      toast.success('Settings updated successfully.');
      router.refresh();
    } else {
      setError(response.message || 'An error occurred.');
    }
    setIsLoading(false);
  };

  console.log(settings);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <Card className="w-full max-w-sm mb-6">
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit}>
            {error && <AlertDestructive message={error} />}

            {settings.length > 0 ? (
              settings.map(setting => {
                return (
                  <div className="grid gap-2 mb-4" key={setting.id}>
                    <Label htmlFor={setting.key}>{setting.key}</Label>
                    <Input
                      id={setting.key}
                      type="text"
                      name={setting.key}
                      defaultValue={setting.value}
                      required
                    />
                  </div>
                );
              })
            ) : (
              <p>No settings found.</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
