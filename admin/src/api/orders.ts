import client from './client';
import type { DashboardStats, Order } from '../types';

export async function fetchAdminStats() {
  const response = await client.get<DashboardStats>('/admin/stats');
  return response.data;
}

export async function fetchOrders() {
  const response = await client.get<Order[]>('/admin/orders');
  return response.data;
}

export async function toggleOrderFulfillment(orderId: string, fulfilled: boolean) {
  const response = await client.patch<Order>(`/admin/orders/${orderId}/fulfill`, { fulfilled });
  return response.data;
}
