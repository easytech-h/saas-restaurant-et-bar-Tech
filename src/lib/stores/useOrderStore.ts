import { create } from 'zustand';
import { localDb } from '../db';
import { Order, OrderStatus } from '../types/orders';

interface OrderState {
  orders: Order[];
  loading: boolean;
  createOrder: (order: Omit<Order, '_id'>) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  loadOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,

  createOrder: async (order) => {
    const id = `orders:${Date.now()}`;
    const orderData = {
      _id: id,
      ...order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await localDb.put(orderData);
      await get().loadOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  updateOrder: async (orderId, updates) => {
    try {
      const doc = await localDb.get(orderId);
      await localDb.put({
        ...doc,
        ...updates,
        updated_at: new Date().toISOString()
      });
      await get().loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const doc = await localDb.get(orderId);
      await localDb.remove(doc);
      await get().loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  },

  loadOrders: async () => {
    set({ loading: true });
    try {
      const result = await localDb.allDocs({
        include_docs: true,
        startkey: 'orders:',
        endkey: 'orders:\ufff0'
      });
      
      set({ 
        orders: result.rows.map(row => row.doc as Order),
        loading: false
      });
    } catch (error) {
      console.error('Failed to load orders:', error);
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const doc = await localDb.get(orderId);
      await localDb.put({
        ...doc,
        status,
        updated_at: new Date().toISOString()
      });
      await get().loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }
}));