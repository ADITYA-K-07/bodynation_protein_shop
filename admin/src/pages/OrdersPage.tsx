import { useMemo, useState } from 'react';
import OrderRow from '../components/OrderRow';
import Toast from '../components/Toast';
import { useOrders } from '../hooks/useOrders';
import type { ToastState } from '../types';

function normalizePaymentFilter(orderPaymentStatus: string, paymentMethod: string) {
  if (orderPaymentStatus.includes('paid')) {
    return 'paid';
  }
  if (orderPaymentStatus.includes('demo')) {
    return 'demo';
  }
  if (paymentMethod === 'cod') {
    return 'cod';
  }
  return 'other';
}

export default function OrdersPage() {
  const { orders, loading, error, setFulfilled } = useOrders();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [toast, setToast] = useState<ToastState | null>(null);

  const filteredOrders = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.customer.name.toLowerCase().includes(searchTerm) ||
        order.orderId.toLowerCase().includes(searchTerm);

      const orderDate = order.createdAt.slice(0, 10);
      const matchesFrom = !dateFrom || orderDate >= dateFrom;
      const matchesTo = !dateTo || orderDate <= dateTo;

      const paymentKey = normalizePaymentFilter(order.payment.status.toLowerCase(), order.paymentMethod);
      const matchesPayment = paymentFilter === 'all' || paymentKey === paymentFilter;

      return matchesSearch && matchesFrom && matchesTo && matchesPayment;
    });
  }, [orders, search, dateFrom, dateTo, paymentFilter]);

  async function handleToggleFulfilled(orderId: string, fulfilled: boolean) {
    try {
      await setFulfilled(orderId, fulfilled);
      setToast({
        message: fulfilled ? 'Order marked fulfilled.' : 'Order moved back to pending.',
        variant: 'success',
      });
    } catch {
      setToast({
        message: 'Could not update fulfillment right now.',
        variant: 'error',
      });
    }
  }

  return (
    <section className="page-stack">
      <div className="section-line">
        <div>
          <p className="eyebrow">Orders</p>
          <h3>Fulfillment board</h3>
        </div>
        <span className="results-count">{filteredOrders.length} results</span>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by customer or order ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="cod">COD</option>
          <option value="demo">Demo</option>
        </select>
      </div>

      <div className="table-card">
        {loading ? <p className="empty-copy">Loading orders...</p> : null}
        {error ? <p className="error-copy">{error}</p> : null}
        {!loading && !filteredOrders.length ? (
          <p className="empty-copy">No orders matched the current filters.</p>
        ) : null}
        {filteredOrders.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Fulfill</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <OrderRow key={order._id} order={order} onToggleFulfilled={handleToggleFulfilled} />
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
