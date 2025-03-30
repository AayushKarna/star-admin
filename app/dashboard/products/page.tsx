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
import { Select } from '@radix-ui/react-select';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface Brand {
  id: number;
  name: string;
  logo: string | null;
  slug: string;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface Specification {
  key: string;
  value: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description?: string | null; // Optional, can be null or undefined
  slug: string;
  markedPrice: string;
  sellingPrice: string;
  stock: number;
  images: string[];
  specifications: Specification[];
  brand: Brand;
  productCategory: ProductCategory;
  tags: Tag[];
}

const columns: { key: keyof Product; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  {
    key: 'productCategory',
    label: 'Category',
    sortable: true,
    render: (row: Product) => row.productCategory.name
  },
  {
    key: 'brand',
    label: 'Brand',
    sortable: true,
    render: (row: Product) => row.brand.name
  },
  { key: 'stock', label: 'Stock', sortable: true },
  {
    key: 'markedPrice',
    label: 'MP',
    sortable: true,
    render: (row: Product) =>
      `Rs. ${Intl.NumberFormat('en-us').format(row.markedPrice)}`
  },
  {
    key: 'sellingPrice',
    label: 'SP',
    sortable: true,
    render: (row: Product) =>
      `Rs. ${Intl.NumberFormat('en-us').format(row.sellingPrice)}`
  }
];

export default function Brands() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: '', value: '' },
    { key: '', value: '' },
    { key: '', value: '' },
    { key: '', value: '' },
    { key: '', value: '' },
    { key: '', value: '' },
    { key: '', value: '' }
  ]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>();
  const [tags, setTags] = useState<Tag[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const handleSpecChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setSpecifications(prevSpecs =>
      prevSpecs.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      )
    );
  };

  const addSpecification = () => {
    setSpecifications(prevSpecs => [...prevSpecs, { key: '', value: '' }]);
  };

  const fetchData = async () => {
    // const response = await ApiService.get('products');
    const [response, brandsResponse, productCategoriesResponse, tagsResponse] =
      await Promise.all([
        ApiService.get('products'),
        ApiService.get('brands'),
        ApiService.get('product-category'),
        ApiService.get('tags')
      ]);

    if (response.isSuccess) {
      setProducts(response.data.data);
      setBrands(brandsResponse.data.data);
      setProductCategories(productCategoriesResponse.data.data);
      setTags(tagsResponse.data.data);
    } else {
      setTableError(response.message || 'An error occurred.');
    }
  };

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    fetchData();

    setBreadcrumb([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Products' }
    ]);
  }, [setBreadcrumb]);

  const handleFileChange = (e: React.FormEvent) => {
    const files = (e.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      setFiles(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(formRef.current || undefined);
    const specs = specifications.filter(spec => spec.key && spec.value);
    formData.set('specifications', JSON.stringify(specs));

    const tags = formData.getAll('tags[]');
    formData.delete('tags[]');

    if (tags) {
      formData.set('tags', JSON.stringify(tags));
    } else {
      formData.delete('tags');
    }

    if (files) {
      const uploadResponse = await ApiService.uploadFiles(files);
      if (!uploadResponse.isSuccess) {
        setError(uploadResponse.message || 'File upload failed.');
        setIsLoading(false);
        return;
      }

      console.log(uploadResponse.data);
      setIsLoading(false);

      formData.set('images', JSON.stringify(uploadResponse.data.fileUrls));
    } else {
      formData.delete('images');
    }

    const response = await ApiService.post('products', formData);
    if (response.isSuccess) {
      toast.success('Product added successfully.');
      formRef.current?.reset();
      setProducts([...products, response.data.data]);
    } else {
      setError(response.message || 'Failed to add product.');
    }

    setIsLoading(false);
  };

  const handleDelete = async (product: Product) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmDelete) return;

    const response = await ApiService.delete(`products/${product.slug}`);
    if (response.isSuccess) {
      setProducts(products.filter(b => b.id !== product.id));
      toast.success('Product deleted successfully.');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <Card className="w-[70%] mb-6">
        <CardHeader>
          <CardTitle>Add new product</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6"
          >
            {/* Left Side: Product Form */}
            <div className="grid gap-4">
              {error && <AlertDestructive message={error} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" name="name" required />
                </div>

                {/* Brand */}
                <div className="grid gap-2">
                  <Label htmlFor="brandId">Brand</Label>
                  <Select name="brandId" required>
                    <SelectTrigger className="w-full" id="brand">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={`${brand.id}`}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="productCategoryId">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map(category => (
                        <SelectItem key={category.id} value={`${category.id}`}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prices */}
                <div className="grid gap-2">
                  <Label htmlFor="markedPrice">Marked Price</Label>
                  <Input
                    id="markedPrice"
                    type="number"
                    name="markedPrice"
                    step={0.1}
                    min={0.1}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    name="sellingPrice"
                    step={0.1}
                    min={0.1}
                    required
                  />
                </div>

                {/* Stock */}
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    name="stock"
                    min={0}
                    step={1}
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="files">Files</Label>
                  <Input
                    id="files"
                    type="file"
                    name="files"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Full-Width Description Field */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description here"
                  className="w-full"
                />
              </div>

              {/* Tags - Checkboxes */}
              <p>Tags</p>
              <div className="flex gap-4 flex-wrap">
                {tags.map(tag => (
                  <Badge
                    variant="secondary"
                    key={tag.id}
                    className="flex gap-2 items-center bg-gray-200 py-2 rounded-md"
                  >
                    <Checkbox
                      id={tag.slug}
                      name="tags[]"
                      value={tag.slug}
                      className="bg-white"
                    />
                    <Label htmlFor={tag.slug}>{tag.name}</Label>
                  </Badge>
                ))}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Add Product'}
              </Button>
            </div>

            {/* Right Side: Specifications */}
            <div className="grid gap-4 border-l pl-6">
              <h3 className="text-md font-semibold">Specifications</h3>
              {/* Add More Rows Button */}
              <Button
                type="button"
                onClick={addSpecification}
                className="w-full bg-gray-300 hover:bg-gray-400"
                variant="outline"
              >
                + Add More Rows
              </Button>

              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    placeholder="Key"
                    value={spec.key}
                    onChange={e =>
                      handleSpecChange(index, 'key', e.target.value)
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Value"
                    value={spec.value}
                    onChange={e =>
                      handleSpecChange(index, 'value', e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Products</CardTitle>
        </CardHeader>
        <CardContent>
          {tableError && <AlertDestructive message={tableError} />}
          <DataTable
            columns={columns}
            data={products}
            onEdit={product =>
              router.push(`/dashboard/products/${product.slug}`)
            }
            onDelete={product => handleDelete(product)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
