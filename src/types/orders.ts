export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customer_name: string;
  customer_phone?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_method: 'cash' | 'card';
  created_at: string;
  updated_at: string;
  notes?: string;
}