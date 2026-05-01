import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchAdminStats } from '../api/orders';
import StatCard from '../components/StatCard';
import type { DashboardStats } from '../types';

const defaultStats: DashboardStats = {
  totalOrders: 0,
  totalRevenue: 0,
  pendingFulfillments: 0,
  todayOrders: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-stack">
      <div className="section-line">
        <div>
          <p className="eyebrow">Snapshot</p>
          <h3>Today at a glance</h3>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Orders"
          value={loading ? '...' : stats.totalOrders.toLocaleString('en-IN')}
          detail="All orders captured in MongoDB"
        />
        <StatCard
          label="Total Revenue"
          value={loading ? '...' : `Rs. ${stats.totalRevenue.toLocaleString('en-IN')}`}
          detail="Gross value across all orders"
        />
        <StatCard
          label="Pending Fulfillments"
          value={loading ? '...' : stats.pendingFulfillments.toLocaleString('en-IN')}
          detail="Orders still waiting to be packed"
        />
        <StatCard
          label="Today's Orders"
          value={loading ? '...' : stats.todayOrders.toLocaleString('en-IN')}
          detail="Orders created since local midnight"
        />
      </div>

      <div className="action-grid">
        <Link className="action-tile" to="/orders">
          <span>Orders</span>
          <strong>Go to Orders</strong>
          <p>Review recent purchases and flip fulfillment state quickly.</p>
        </Link>
        <Link className="action-tile" to="/products?new=1">
          <span>Catalog</span>
          <strong>Add New Product</strong>
          <p>Open the product form with Cloudinary image upload ready.</p>
        </Link>
        <Link className="action-tile" to="/products">
          <span>Visibility</span>
          <strong>Manage Products</strong>
          <p>Edit details, zero stock, or hide products from the storefront.</p>
        </Link>
      </div>
    </section>
  );
}
