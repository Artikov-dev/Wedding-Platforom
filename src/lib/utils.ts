export const formatPrice = (price: number): string => {
  return price.toLocaleString('uz-UZ') + " so'm";
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (date: string): string => {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const DISTRICTS: string[] = [
  'Bektemir',
  'Chilonzor',
  'Mirobod',
  'Mirzo Ulug\'bek',
  'Olmazor',
  'Sergeli',
  'Shayxontohur',
  'Uchtepa',
  'Yakkasaroy',
  'Yunusobod',
  'Yashnobod',
  'Toshkent tumani',
];

export const HALL_CATEGORIES: { value: string; label: string }[] = [
  { value: 'ECONOMY', label: 'Ekonom' },
  { value: 'STANDARD', label: 'Standart' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'VIP', label: 'VIP' },
];

export const BOOKING_STATUSES: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlangan',
  CANCELLED: 'Bekor qilingan',
  COMPLETED: 'Yakunlangan',
};

export const PAYMENT_STATUSES: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  PAID: "To'langan",
  PARTIAL: 'Qisman',
  REFUNDED: 'Qaytarilgan',
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
    case 'PAID':
    case 'COMPLETED':
    case 'Tasdiqlangan':
      return 'var(--color-success)';
    case 'PENDING':
    case 'PARTIAL':
    case 'Kutilmoqda':
      return 'var(--color-warning)';
    case 'CANCELLED':
    case 'REFUNDED':
    case 'Bekor qilingan':
      return 'var(--color-danger)';
    default:
      return 'var(--color-text-secondary)';
  }
};

export const cn = (...classes: (string | false | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
