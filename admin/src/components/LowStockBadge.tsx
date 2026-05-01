interface LowStockBadgeProps {
  stock: number;
}

export default function LowStockBadge({ stock }: LowStockBadgeProps) {
  if (stock === 0) {
    return <span className="status-pill status-pill--danger">Out of stock</span>;
  }

  if (stock <= 5) {
    return <span className="status-pill status-pill--warning">Low stock</span>;
  }

  return <span className="status-pill status-pill--success">Healthy stock</span>;
}
