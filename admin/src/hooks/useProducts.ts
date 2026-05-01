import { useEffect, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  toggleProductActive,
  toggleProductStock,
  updateProduct,
  type ProductInput,
} from '../api/products';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      setProducts(await fetchProducts());
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function addProduct(payload: ProductInput) {
    const product = await createProduct(payload);
    setProducts((currentProducts) => [...currentProducts, product]);
    return product;
  }

  async function saveProduct(productId: string, payload: ProductInput) {
    const product = await updateProduct(productId, payload);
    setProducts((currentProducts) =>
      currentProducts.map((item) => (item._id === productId ? product : item)),
    );
    return product;
  }

  async function removeProduct(productId: string) {
    await deleteProduct(productId);
    setProducts((currentProducts) => currentProducts.filter((item) => item._id !== productId));
  }

  async function setActive(productId: string, isActive: boolean) {
    const product = await toggleProductActive(productId, isActive);
    setProducts((currentProducts) =>
      currentProducts.map((item) => (item._id === productId ? product : item)),
    );
  }

  async function toggleStock(productId: string) {
    const product = await toggleProductStock(productId);
    setProducts((currentProducts) =>
      currentProducts.map((item) => (item._id === productId ? product : item)),
    );
  }

  return {
    products,
    loading,
    error,
    reload: loadProducts,
    addProduct,
    saveProduct,
    removeProduct,
    setActive,
    toggleStock,
  };
}
