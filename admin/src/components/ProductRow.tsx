import LowStockBadge from './LowStockBadge';
import type { Product } from '../types';

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product, isActive: boolean) => void;
  onToggleStock: (product: Product) => void;
}

export default function ProductRow({
  product,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleStock,
}: ProductRowProps) {
  const lowestStock = Math.min(...product.variants.map((variant) => variant.stock));
  const firstVariant = product.variants[0];

  return (
    <tr>
      <td>
        <div className="product-cell">
          <img src={product.image} alt={product.name} />
          <div>
            <strong>{product.name}</strong>
            <p>{product.brand}</p>
          </div>
        </div>
      </td>
      <td>{product.category}</td>
      <td>{firstVariant ? `Rs. ${firstVariant.price.toLocaleString('en-IN')}` : 'Rs. 0'}</td>
      <td>{product.variants.length}</td>
      <td>
        <LowStockBadge stock={lowestStock} />
      </td>
      <td>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={product.isActive}
            onChange={(event) => onToggleActive(product, event.target.checked)}
          />
          <span>{product.isActive ? 'Visible' : 'Hidden'}</span>
        </label>
      </td>
      <td>
        <button type="button" className="table-link" onClick={() => onToggleStock(product)}>
          {lowestStock === 0 ? 'Restore' : 'Zero Out'}
        </button>
      </td>
      <td>
        <div className="table-actions">
          <button type="button" className="table-link" onClick={() => onEdit(product)}>
            Edit
          </button>
          <button type="button" className="table-link table-link--danger" onClick={() => onDelete(product)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
