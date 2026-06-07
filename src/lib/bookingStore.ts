// Local booking cache — workaround for /api/bookings 500 on ADMIN/CUSTOMER
// When backend is fixed, this can be removed

import { Booking } from '@/types';

const KEY = 'weddingBookingsCache';

function getAll(): Booking[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(bookings: Booking[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(bookings.slice(0, 200)));
}

export const bookingStore = {
  add(booking: Booking) {
    const existing = getAll();
    const filtered = existing.filter(b => b.id !== booking.id);
    save([booking, ...filtered]);
  },
  remove(id: string) {
    save(getAll().filter(b => b.id !== id));
  },
  updateStatus(id: string, status: string) {
    save(getAll().map(b => b.id === id ? { ...b, status } : b));
  },
  getByUser(userId: string): Booking[] {
    return getAll().filter(b => b.userId === userId || !b.userId);
  },
  getAll,
  clear() { if (typeof window !== 'undefined') localStorage.removeItem(KEY); },
};
