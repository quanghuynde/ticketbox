import { request } from './api';

export function getTickets() {
  return request('/tickets');
}

export function getTicketsByEvent(eventId) {
  return request(`/tickets/event/${eventId}`);
}

export function getTicket(ticketId) {
  return request(`/tickets/${ticketId}`);
}
