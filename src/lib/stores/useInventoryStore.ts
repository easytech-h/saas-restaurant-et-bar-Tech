import { create } from 'zustand';
import { localDb } from '../db';

interface InventoryState {
  products: any[];
  loading: boolean;
  loadProducts: (page?: number, limit?: number) => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (productId: string, product: any) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateStock: (productId: string, quantity: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  loading: false,

  loadProducts: async (page = 1, limit = 20) => {
    set({ loading: true });
    try {
      const result = await localDb.allDocs({
        include_docs: true,
        startkey: 'products:',
        endkey: 'products:\ufff0',
        limit,
        skip: (page - 1) * limit
      });
      
      set({ 
        products: result.rows.map(row => row.doc),
        loading: false
      });
    } catch (error) {
      console.error('Failed to load products:', error);
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    const id = `products:${Date.now()}`;
    await localDb.put({
      _id: id,
      ...product
    });
    get().loadProducts();
  },

  updateProduct: async (productId: string, product: any) => {
    try {
      const doc = await localDb.get(productId);
      await localDb.put({
        ...doc,
        ...product
      });
      get().loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      const doc = await localDb.get(productId);
      await localDb.remove(doc);
      get().loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  },

  updateStock: async (productId: string, quantity: number) => {
    try {
      const doc = await localDb.get(productId);
      await localDb.put({
        ...doc,
        stock: Math.max(0, doc.stock + quantity)
      });
      get().loadProducts();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  },
}));