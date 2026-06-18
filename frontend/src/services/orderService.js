import { request } from './api';

export function getOrders() {
  return request('/orders');
}

export function getOrder(orderId) {
  return request(`/orders/${orderId}`);
}

export function createOrder(payload) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export function deleteOrder(orderId) {
  return request(`/orders/${orderId}`, {
    method: 'DELETE'
  });
}
