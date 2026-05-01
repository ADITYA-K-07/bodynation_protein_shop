import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductFormModal from '../components/ProductFormModal';
import ProductRow from '../components/ProductRow';
import Toast from '../components/Toast';
import { useProducts } from '../hooks/useProducts';
import type { Product, ToastState } from '../types';
import type { ProductInput } from '../api/products';

export default function ProductsPage() {
  const { products, loading, error, addProduct, saveProduct, removeProduct, setActive, toggleStock } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingProduct(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm);

      const matchesCategory = category === 'all' || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  async function handleSubmit(payload: ProductInput, productId?: string) {
    try {
      if (productId) {
        await saveProduct(productId, payload);
        setToast({ message: 'Product updated successfully.', variant: 'success' });
      } else {
        await addProduct(payload);
        setToast({ message: 'Product added to the catalog.', variant: 'success' });
      }
    } catch {
      setToast({ message: 'Product save failed.', variant: 'error' });
      throw new Error('Product save failed');
    }
  }

  async function handleDelete() {
    if (!productToDelete) {
      return;
    }

    try {
      await removeProduct(productToDelete._id);
      setToast({ message: 'Product removed from the catalog.', variant: 'success' });
    } catch {
      setToast({ message: 'Product delete failed.', variant: 'error' });
    } finally {
      setProductToDelete(null);
    }
  }

  async function handleToggleActive(product: Product, isActive: boolean) {
    try {
      await setActive(product._id, isActive);
      setToast({
        message: isActive ? 'Product is now visible.' : 'Product hidden from storefront.',
        variant: 'success',
      });
    } catch {
      setToast({ message: 'Could not update visibility.', variant: 'error' });
    }
  }

  async function handleToggleStock(product: Product) {
    try {
      await toggleStock(product._id);
      setToast({ message: 'Stock state updated.', variant: 'success' });
    } catch {
      setToast({ message: 'Could not update stock.', variant: 'error' });
    }
  }

  return (
    <section className="page-stack">
      <div className="section-line">
        <div>
          <p className="eyebrow">Products</p>
          <h3>Catalog management</h3>
        </div>
        <button type="button" className="button button--primary" onClick={openCreateModal}>
          Add Product
        </button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by name or brand"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((entry) => (
            <option key={entry} value={entry}>
              {entry === 'all' ? 'All categories' : entry}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        {loading ? <p className="empty-copy">Loading products...</p> : null}
        {error ? <p className="error-copy">{error}</p> : null}
        {!loading && !filteredProducts.length ? (
          <p className="empty-copy">No products matched the current filters.</p>
        ) : null}
        {filteredProducts.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Variants</th>
                <th>Stock</th>
                <th>Active</th>
                <th>Out of Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onEdit={(currentProduct) => {
                    setEditingProduct(currentProduct);
                    setModalOpen(true);
                  }}
                  onDelete={setProductToDelete}
                  onToggleActive={handleToggleActive}
                  onToggleStock={handleToggleStock}
                />
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <ProductFormModal
        open={modalOpen}
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title={productToDelete ? `Delete ${productToDelete.name}?` : 'Delete product?'}
        copy="This removes the product permanently from the collection."
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        onCancel={() => setProductToDelete(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
