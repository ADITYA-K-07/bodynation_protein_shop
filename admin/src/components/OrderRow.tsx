import type { Order } from '../types';

interface OrderRowProps {
  order: Order;
  onToggleFulfilled: (orderId: string, fulfilled: boolean) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function paymentTone(order: Order) {
  if (order.payment.status.includes('paid')) {
    return 'success';
  }
  if (order.payment.status.includes('demo')) {
    return 'muted';
  }
  if (order.paymentMethod === 'cod') {
    return 'warning';
  }
  return 'info';
}

function paymentLabel(order: Order) {
  if (order.payment.status.includes('paid')) {
    return 'Paid';
  }
  if (order.payment.status.includes('demo')) {
    return 'Demo';
  }
  if (order.paymentMethod === 'cod') {
    return 'COD';
  }
  return order.payment.status;
}

export default function OrderRow({ order, onToggleFulfilled }: OrderRowProps) {
  return (
    <tr className={order.fulfilled ? '' : 'table-row--attention'}>
      <td>{order.orderId}</td>
      <td>{order.customer.name}</td>
      <td>{order.customer.phone}</td>
      <td>{order.items.map((item) => `${item.name} x ${item.qty}`).join(', ')}</td>
      <td>Rs. {order.total.toLocaleString('en-IN')}</td>
      <td>
        <span className={`status-pill status-pill--${paymentTone(order)}`}>{paymentLabel(order)}</span>
      </td>
      <td>{formatDate(order.createdAt)}</td>
      <td>
        <span className={`status-pill ${order.fulfilled ? 'status-pill--success' : 'status-pill--warning'}`}>
          {order.fulfilled ? 'Fulfilled' : 'Pending'}
        </span>
      </td>
      <td>
        <input
          type="checkbox"
          checked={order.fulfilled}
          onChange={(event) => onToggleFulfilled(order._id, event.target.checked)}
          aria-label={`Toggle fulfilled for ${order.orderId}`}
        />
      </td>
    </tr>
  );
}
