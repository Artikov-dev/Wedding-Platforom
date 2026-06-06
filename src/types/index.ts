export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  error: string;
  statusCode: number;
}

export type UserRole = 'ADMIN' | 'HALL_OWNER' | 'SERVICE_PROVIDER' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Hall {
  id: string;
  name: string;
  description: string;
  category: string;
  capacity: number;
  pricePerPlate: number;
  imageUrl?: string;
  images?: string[];
  city?: string;
  address?: string;
  phone?: string;
  rating?: number;
  status?: string;
  ownerId?: string;
  owner?: User;
  amenities?: Amenity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Amenity {
  id: string;
  name: string;
  description?: string;
  hallId: string;
}

export interface Booking {
  id: string;
  hallId: string;
  hall?: Hall;
  userId?: string;
  user?: User;
  eventDate: string;
  eventTime?: string;
  numberOfGuests: number;
  notes?: string;
  totalAmount: number;
  advanceAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus?: string;
  serviceProviderIds?: string[];
  createdAt?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  pricing: number;
  imageUrl?: string;
}

export interface Favorite {
  id: string;
  hallId: string;
  hall?: Hall;
  userId: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod?: string;
  paymentMethodId?: string;
  status?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  hallId: string;
  userId?: string;
  user?: User;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface ChatConversation {
  id: string;
  participants?: User[];
  lastMessage?: ChatMessage;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId?: string;
  sender?: User;
  content: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
}

export interface Invitation {
  id: string;
  bookingId: string;
  email: string;
  phone: string;
  guestCount: number;
  message: string;
  status: string;
  createdAt?: string;
}
