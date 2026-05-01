import client from './client';
import type { Product } from '../types';

export type ProductInput = Omit<Product, '_id' | 'createdAt' | 'updatedAt'>;

export async function fetchProducts() {
  const response = await client.get<Product[]>('/admin/products');
  return response.data;
}

export async function createProduct(payload: ProductInput) {
  const response = await client.post<Product>('/admin/products', payload);
  return response.data;
}

export async function updateProduct(productId: string, payload: ProductInput) {
  const response = await client.put<Product>(`/admin/products/${productId}`, payload);
  return response.data;
}

export async function deleteProduct(productId: string) {
  await client.delete(`/admin/products/${productId}`);
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const response = await client.patch<Product>(`/admin/products/${productId}/active`, { isActive });
  return response.data;
}

export async function toggleProductStock(productId: string) {
  const response = await client.patch<Product>(`/admin/products/${productId}/stock`);
  return response.data;
}
