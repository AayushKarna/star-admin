'use client';

import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive } from '@/components/alert-destructive';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ApiService from '@/app/utils/apiService';
import { useParams, useRouter } from 'next/navigation';
import { Select } from '@radix-ui/react-select';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BASE_URL } from '@/app/constants/constants';
import Image from 'next/image';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function EditProduct() {
  const [product, setProduct] = useState<Product>({
    id: 0,
    name: '',
    slug: '',
    markedPrice: '',
    sellingPrice: '',
    stock: 0,
    images: [],
    brand: { id: 0, name: '', logo: null, slug: '' },
    productCategory: { id: 0, name: '', slug: '' },
    specifications: [],
    tags: []
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>();
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const { slug } = useParams();

  const handleSpecChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setProduct(prevProduct => {
      const newSpecs = [...prevProduct.specifications];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prevProduct, specifications: newSpecs };
    });
  };

  const addSpecification = () => {
    setProduct(prevProduct => ({
      ...prevProduct,
      specifications: [...prevProduct.specifications, { key: '', value: '' }]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      // const response = await ApiService.get('products');
      const [
        response,
        brandsResponse,
        productCategoriesResponse,
        tagsResponse
      ] = await Promise.all([
        ApiService.get(`products/${slug}`),
        ApiService.get('brands'),
        ApiService.get('product-category'),
        ApiService.get('tags')
      ]);

      if (response.isSuccess) {
        const responseProduct = response.data.data;
        responseProduct.specifications = JSON.parse(
          responseProduct.specifications
        );
        const tags = responseProduct.tags.map((tag: { tag: Tag }) => tag.tag);
        responseProduct.tags = tags;

        setProduct(responseProduct);
        setBrands(brandsResponse.data.data);
        setProductCategories(productCategoriesResponse.data.data);
        setTags(tagsResponse.data.data);
      } else {
        setError(response.message || 'Failed to fetch product.');
      }
    };

    fetchData();
  }, [slug]);

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
    const specs = product.specifications.filter(spec => spec.key && spec.value);
    formData.set('specifications', JSON.stringify(specs));

    const tags = formData.getAll('tags[]');
    formData.delete('tags[]');

    if (tags) {
      formData.set('tags', JSON.stringify(tags));
    } else {
      formData.delete('tags');
    }

    if (files && files.length > 0) {
      const uploadResponse = await ApiService.uploadFiles(files);
      if (!uploadResponse.isSuccess) {
        setError(uploadResponse.message || 'File upload failed.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      formData.set(
        'images',
        JSON.stringify([...product.images, ...uploadResponse.data.fileUrls])
      );
    } else {
      formData.set('images', JSON.stringify(product.images));
    }

    const response = await ApiService.patch(
      `products/${product.slug}`,
      formData
    );
    if (response.isSuccess) {
      toast.success('Product edited successfully.');
      router.push(`/dashboard/products/${response.data.data.slug}`);
    } else {
      setError(response.message || 'Failed to add product.');
    }

    setIsLoading(false);
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <Card className="w-[70%] mb-6">
        <CardHeader>
          <CardTitle>Edit product</CardTitle>
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
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={e =>
                      setProduct({ ...product, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Brand */}
                <div className="grid gap-2">
                  <Label htmlFor="brandId">Brand</Label>
                  <Select
                    name="brandId"
                    value={`${product.brand.id}`}
                    onValueChange={value => {
                      const selectedBrand = brands.find(
                        brand => brand.id === Number(value)
                      );
                      if (selectedBrand) {
                        setProduct(prev => ({
                          ...prev,
                          brand: selectedBrand
                        }));
                      }
                    }}
                    required
                  >
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
                  <Select
                    name="productCategoryId"
                    value={`${product.productCategory.id}`}
                    onValueChange={value => {
                      const selectedCategory = productCategories.find(
                        cat => cat.id === Number(value)
                      );
                      if (selectedCategory) {
                        setProduct(prev => ({
                          ...prev,
                          productCategory: selectedCategory
                        }));
                      }
                    }}
                    required
                  >
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
                    value={product.markedPrice}
                    onChange={e =>
                      setProduct({ ...product, markedPrice: e.target.value })
                    }
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
                    value={product.sellingPrice}
                    onChange={e =>
                      setProduct({ ...product, sellingPrice: e.target.value })
                    }
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
                    value={product.stock}
                    onChange={e =>
                      setProduct({ ...product, stock: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="files">Add Images</Label>
                  <Input
                    id="files"
                    type="file"
                    name="files"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-col gap-2">
                    {product.images.map((image, index) => (
                      <div
                        key={image}
                        className="bg-gray-200 p-2 rounded-md relative"
                      >
                        <Image
                          src={`${BASE_URL}${image}`}
                          alt="Product Image"
                          className="w-auto h-30 object-contain"
                          width={500}
                          height={500}
                        />

                        {/* delete button */}
                        <Button
                          type="button"
                          onClick={() =>
                            setProduct(prev => {
                              const newImages = [...prev.images];
                              newImages.splice(index, 1);
                              return { ...prev, images: newImages };
                            })
                          }
                          className="absolute top-2 right-2"
                          variant="destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                  value={product.description || ''}
                  onChange={e =>
                    setProduct({ ...product, description: e.target.value })
                  }
                />
              </div>

              {/* Tags - Checkboxes */}
              <p>Tags</p>
              <div className="flex gap-4 flex-wrap">
                {tags.map(tag => (
                  <Badge
                    variant="secondary"
                    key={tag.slug}
                    className="flex gap-2 items-center bg-gray-200 py-2 rounded-md"
                  >
                    <Checkbox
                      id={`${tag.id}`}
                      name="tags[]"
                      value={tag.slug}
                      className="bg-white"
                      checked={product.tags.some(t => t.id === tag.id)}
                      onCheckedChange={checked =>
                        setProduct(prev => ({
                          ...prev,
                          tags: checked
                            ? [...(prev.tags || []), { ...tag }]
                            : prev.tags.filter(t => t.id !== tag.id)
                        }))
                      }
                    />
                    <Label htmlFor={`${tag.id}`}>{tag.name}</Label>
                  </Badge>
                ))}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Edit Product'}
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

              {product.specifications.map((spec, index) => (
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
    </div>
  );
}
