// src/types/product.ts
export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  vram: string;
  price: number;
  specs: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  fullSpecs?: ProductSpec[];
}