import { apiPost, apiGet, apiPatch } from './client';
import type { Order, ShippingAddress } from '../types';

export function createOrder(items: { productId: string; quantity: number; price: number }[], shippingAddress: ShippingAddress, sendAuth = true) {
  return apiPost<Order>('/orders', { items, shippingAddress }, sendAuth);
}

export function fetchMyOrders() {
  return apiGet<Order[]>('/orders/my');
}

export function fetchAllOrders() {
  return apiGet<Order[]>('/orders');
}

export function fetchOrder(id: string) {
  return apiGet<Order>(`/orders/${id}`);
}

export function updateOrderStatus(id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered') {
  return apiPatch<Order>(`/orders/${id}`, { status });
}
