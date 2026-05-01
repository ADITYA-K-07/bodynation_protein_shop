import { useEffect, useState } from 'react';
import { fetchOrders, toggleOrderFulfillment } from '../api/orders';
import type { Order } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      setOrders(await fetchOrders());
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function setFulfilled(orderId: string, fulfilled: boolean) {
    const previousOrders = orders;
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              fulfilled,
              fulfilledAt: fulfilled ? new Date().toISOString() : null,
            }
          : order,
      ),
    );

    try {
      const updatedOrder = await toggleOrderFulfillment(orderId, fulfilled);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
    } catch (err) {
      setOrders(previousOrders);
      throw err;
    }
  }

  return {
    orders,
    loading,
    error,
    reload: loadOrders,
    setFulfilled,
  };
}
