import api from '@/lib/api';
import type {
  ApiResponse,
  User,
  AuthResponse,
  Hall,
  Amenity,
  Booking,
  ServiceProvider,
  Favorite,
  Payment,
  Review,
  ChatConversation,
  ChatMessage,
  Notification,
  Invitation,
} from '@/types';

// ─── Pagination wrapper ────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Extra types ───────────────────────────────────────────────────────────────
export interface Owner extends User {
  hall?: Hall;
}

export interface DashboardStats {
  totalHalls?: number;
  totalBookings?: number;
  totalUsers?: number;
  totalRevenue?: number;
  pendingApprovals?: number;
  activeBookings?: number;
  [key: string]: unknown;
}

export interface PublicStats {
  totalHalls?: number;
  totalBookings?: number;
  totalUsers?: number;
  [key: string]: unknown;
}

// ─── 1. AUTH ──────────────────────────────────────────────────────────────────

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password }),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'CUSTOMER' | 'HALL_OWNER';
  }) => api.post<ApiResponse<null>>('/api/auth/register', data),

  verifyOtp: (email: string, code: string, purpose?: string) =>
    api.post<ApiResponse<null>>('/api/auth/verify-otp', { email, code, purpose }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/api/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/api/auth/reset-password', { email, code, newPassword }),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ token: string; refreshToken: string }>>('/api/auth/refresh', { refreshToken }),

  me: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),
};

// ─── 2. HALLS ─────────────────────────────────────────────────────────────────

export interface HallSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  ownerId?: string;
  approvalStatus?: string;
}

export const hallsService = {
  search: (params?: HallSearchParams) =>
    api.get<ApiResponse<{ halls: Hall[]; pagination: Pagination }>>('/api/halls/search', { params }),

  ownerHalls: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ halls: Hall[]; pagination: Pagination }>>('/api/halls/owner', { params }),

  getById: (hallId: string) =>
    api.get<ApiResponse<Hall>>(`/api/halls/${hallId}`),

  getBookedDates: (hallId: string) =>
    api.get<ApiResponse<{ bookedDates: string[], bookedDetails?: Record<string, string> }>>(`/api/halls/${hallId}/booked-dates`),

  getAmenities: (hallId: string) =>
    api.get<ApiResponse<Amenity[]>>(`/api/halls/${hallId}/amenities`),

  create: (data: Partial<Hall>) =>
    api.post<ApiResponse<Hall>>('/api/halls/create', data),

  update: (hallId: string, data: Partial<Hall>) =>
    api.put<ApiResponse<Hall>>(`/api/halls/${hallId}`, data),

  delete: (hallId: string) =>
    api.delete<ApiResponse<null>>(`/api/halls/${hallId}`),
};

// ─── 3. BOOKINGS ──────────────────────────────────────────────────────────────

export interface BookingCreateData {
  hallId: string;
  eventDate: string;       // ISO: "2026-12-25T10:00:00.000Z"
  eventTime?: string;      // "18:00"
  numberOfGuests: number;
  notes?: string;
  totalAmount: number;
  advanceAmount: number;
  finalAmount: number;
  serviceProviderIds?: string[];
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  userId?: string;
}

export const bookingsService = {
  list: (params?: BookingListParams) =>
    api.get<ApiResponse<{ bookings: Booking[]; pagination: Pagination }>>('/api/bookings', { params }),

  myBookings: (params?: BookingListParams) =>
    api.get<ApiResponse<{ bookings: Booking[]; pagination: Pagination }>>('/api/bookings', { params }),

  getById: (bookingId: string) =>
    api.get<ApiResponse<Booking>>(`/api/bookings/${bookingId}`),

  create: (data: BookingCreateData) =>
    api.post<ApiResponse<Booking>>('/api/bookings/create', data),

  updateStatus: (bookingId: string, status: string) =>
    api.put<ApiResponse<Booking>>(`/api/bookings/${bookingId}`, { status }),

  update: (bookingId: string, data: Partial<Booking>) =>
    api.put<ApiResponse<Booking>>(`/api/bookings/${bookingId}`, data),

  cancel: (bookingId: string) =>
    api.delete<ApiResponse<null>>(`/api/bookings/${bookingId}`),
};

// ─── 4. PAYMENTS ─────────────────────────────────────────────────────────────

export interface PaymentCreateData {
  bookingId: string;
  amount: number;
  paymentType: 'ADVANCE' | 'FINAL' | 'SERVICE';
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'STRIPE';
}

export const paymentsService = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ payments: Payment[]; pagination?: Pagination }>>('/api/payments', { params }),

  create: (data: PaymentCreateData) =>
    api.post<ApiResponse<Payment>>('/api/payments/create', data),
};

// ─── 5. FAVORITES ────────────────────────────────────────────────────────────

export const favoritesService = {
  list: () =>
    api.get<ApiResponse<Favorite[]>>('/api/favorites'),

  add: (hallId: string) =>
    api.post<ApiResponse<Favorite | null>>('/api/favorites', { hallId }),

  remove: (hallId: string) =>
    api.delete<ApiResponse<null>>(`/api/favorites/${hallId}`),
};

// ─── 6. REVIEWS ──────────────────────────────────────────────────────────────

export const reviewsService = {
  list: (params?: { hallId?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ reviews: Review[]; pagination?: Pagination }>>('/api/reviews', { params }),

  create: (data: { hallId: string; rating: number; comment?: string }) =>
    api.post<ApiResponse<Review>>('/api/reviews/create', data),
};

// ─── 7. SERVICES (xizmat ko'rsatuvchilar) ────────────────────────────────────

export const servicesService = {
  list: () =>
    api.get<ApiResponse<ServiceProvider[]>>('/api/services'),

  getById: (serviceId: string) =>
    api.get<ApiResponse<ServiceProvider>>(`/api/services/${serviceId}`),

  create: (data: Partial<ServiceProvider>) =>
    api.post<ApiResponse<ServiceProvider>>('/api/services', data),

  update: (serviceId: string, data: Partial<ServiceProvider>) =>
    api.put<ApiResponse<ServiceProvider>>(`/api/services/${serviceId}`, data),

  delete: (serviceId: string) =>
    api.delete<ApiResponse<null>>(`/api/services/${serviceId}`),
};

// ─── 8. NOTIFICATIONS ────────────────────────────────────────────────────────

export const notificationsService = {
  list: () =>
    api.get<ApiResponse<Notification[]>>('/api/notifications'),

  markRead: (id: string) =>
    api.patch<ApiResponse<null>>(`/api/notifications/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/notifications/${id}`),
};

// ─── 9. CHAT ─────────────────────────────────────────────────────────────────

export const chatService = {
  listConversations: () =>
    api.get<ApiResponse<ChatConversation[]>>('/api/chat/conversations'),

  createConversation: (participantIds: string[]) =>
    api.post<ApiResponse<ChatConversation>>('/api/chat/conversations', { participantIds }),

  getMessages: (conversationId: string) =>
    api.get<ApiResponse<ChatMessage[]>>(`/api/chat/conversations/${conversationId}`),

  sendMessage: (conversationId: string, content: string) =>
    api.post<ApiResponse<ChatMessage>>('/api/chat/messages', { conversationId, content }),
};

// ─── 10. INVITATIONS ─────────────────────────────────────────────────────────

export const invitationsService = {
  list: () =>
    api.get<ApiResponse<Invitation[]>>('/api/invitations'),

  create: (data: {
    bookingId: string;
    guestEmails: string[];
    message?: string;
    guestCount?: number;
  }) => api.post<ApiResponse<Invitation>>('/api/invitations/create', data),

  updateStatus: (invitationId: string, status: 'ACCEPTED' | 'DECLINED') =>
    api.patch<ApiResponse<Invitation>>(`/api/invitations/${invitationId}`, { status }),
};

// ─── 11. ADMIN ───────────────────────────────────────────────────────────────

export const adminService = {
  // Settings
  getSettings: () =>
    api.get<ApiResponse<Record<string, any>>>('/api/admin/settings'),

  updateSettings: (data: Record<string, any>) =>
    api.post<ApiResponse<Record<string, any>>>('/api/admin/settings', data),

  // Bulk
  bulkAction: (data: { resource: string; action: string; ids: string[]; value?: any }) =>
    api.post<ApiResponse<{ updatedCount: number }>>('/api/admin/bulk', data),

  // Logs
  getLogs: (params?: { action?: string; userId?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ logs: any[]; pagination?: Pagination }>>('/api/admin/logs', { params }),

  // Dashboard
  getDashboard: (type: 'overview' | 'analytics' | 'trends' = 'overview') =>
    api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard', { params: { type } }),

  // Users
  getUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ users: User[]; pagination?: Pagination }>>('/api/users', { params }),

  getUserById: (userId: string) =>
    api.get<ApiResponse<User>>(`/api/admin/users/${userId}`),

  updateUser: (userId: string, data: Partial<User> & { status?: string }) =>
    api.put<ApiResponse<User>>(`/api/admin/users/${userId}`, data),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse<null>>(`/api/admin/users/${userId}`),

  // Owners
  getOwners: (params?: { search?: string }) =>
    api.get<ApiResponse<{ owners: Owner[] } | Owner[]>>('/api/owners', { params }),

  createOwner: (data: { email: string; phone: string; firstName: string; lastName: string }) =>
    api.post<ApiResponse<Owner>>('/api/owners', data),

  getOwnerById: (id: string) =>
    api.get<ApiResponse<Owner>>(`/api/owners/${id}`),

  updateOwner: (id: string, data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.put<ApiResponse<Owner>>(`/api/owners/${id}`, data),

  deleteOwner: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/owners/${id}`),

  // Halls
  getAllHalls: (params?: { approvalStatus?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ halls: Hall[]; pagination?: Pagination }>>('/api/admin/halls', { params }),

  getHallApprovals: (params?: { status?: string }) =>
    api.get<ApiResponse<{ halls: Hall[] }>>('/api/admin/hall-approvals', { params }),

  approveHall: (hallId: string, approvalStatus: 'APPROVED' | 'REJECTED') =>
    api.put<ApiResponse<Hall>>(`/api/halls/${hallId}`, { approvalStatus }),
};

// ─── 12. PUBLIC STATS ────────────────────────────────────────────────────────

export const publicService = {
  getStats: () =>
    api.get<ApiResponse<PublicStats>>('/api/stats'),

  getRegions: () =>
    api.get<ApiResponse<{ id: string; name: string }[]>>('/api/regions'),

  getDistricts: (regionId?: string) =>
    api.get<ApiResponse<{ id: string; name: string; regionId?: string }[]>>('/api/districts', {
      params: regionId ? { regionId } : undefined,
    }),

  getSingers: () =>
    api.get<ApiResponse<ServiceProvider[]>>('/api/singers'),

  getCars: () =>
    api.get<ApiResponse<ServiceProvider[]>>('/api/cars'),
};
