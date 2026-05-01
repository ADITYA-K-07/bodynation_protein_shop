export interface ProductVariant {
  id: string;
  flavour: string;
  size: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Product {
  _id: string;
  id: string;
  slug: string;
  brand: string;
  name: string;
  shortName: string;
  category: string;
  goal: string;
  color: string;
  image: string;
  heroImage: string;
  ratingAverage: number;
  ratingCount: number;
  badges: string[];
  description: string;
  highlights: string[];
  nutritionFacts: string[];
  variants: ProductVariant[];
  labReportUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productSlug: string;
  name: string;
  variant: string;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  payment: {
    status: string;
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
    razorpay_signature?: string | null;
  };
  fulfilled: boolean;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingFulfillments: number;
  todayOrders: number;
}

export interface ToastState {
  message: string;
  variant: 'success' | 'error' | 'info';
}
