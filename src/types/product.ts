// src/types/product.ts
export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  specs: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  images?: string[];
  fullSpecs?: ProductSpec[];
  deletedAt?: Date | null;
  createdAt?: string;
  updatedAt?: string;
}
