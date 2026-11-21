import { LocalizedText } from './translations';

export type { LocalizedText };

export interface Category {
  _id: string;
  name: LocalizedText;
}

export interface Item {
  _id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  image: string;
  categoryId: string;
  quantity?: number;
}

export interface CartLine {
  itemId: string;
  quantity: number;
}

export interface CartRow {
  item: Item;
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

export type OrderStatus = 'opened' | 'closed';
export type PaymentMethod = 'cod' | 'stripe';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface PaymentMethods {
  methods: PaymentMethod[];
  stripeTestMode: boolean;
}

export interface PaymentState {
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
}

export interface PlacedOrder {
  orderId: string;
  total: number;
  checkoutUrl?: string;
  token?: string;
}

export interface OrderLine {
  itemId: string;
  name: LocalizedText;
  price: number;
  quantity: number;
}

export interface OrderNote {
  text: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  customer: Customer;
  items: OrderLine[];
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  stripeDetails?: { sessionId: string | null; paymentIntentId: string | null };
  notes: OrderNote[];
  createdAt: string;
}
