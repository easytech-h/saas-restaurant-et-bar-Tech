import { create } from 'zustand';
import { localDb } from '../db';
import { Sale } from '../types/sales';

interface SalesState {
  sales: Sale[];
  loading: boolean;
  createSale: (sale: Omit<Sale, '_id'>) => Promise<void>;
  loadSales: (page?: number, limit?: number) => Promise<void>;
  getSalesByDateRange: (startDate: Date, endDate: Date, limit?: number) => Promise<Sale[]>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  loading: false,

  createSale: async (sale) => {
    const id = `sales:${Date.now()}`;
    const saleData = {
      _id: id,
      ...sale,
      date: new Date().toISOString()
    };

    try {
      await localDb.put(saleData);
      await get().loadSales();
    } catch (error) {
      console.error('Failed to create sale:', error);
      throw error;
    }
  },

  loadSales: async (page = 1, limit = 20) => {
    set({ loading: true });
    try {
      const result = await localDb.allDocs({
        include_docs: true,
        startkey: 'sales:',
        endkey: 'sales:\ufff0',
        limit,
        skip: (page - 1) * limit
      });
      
      set({ 
        sales: result.rows.map(row => row.doc as Sale),
        loading: false
      });
    } catch (error) {
      console.error('Failed to load sales:', error);
      set({ loading: false });
    }
  },

  getSalesByDateRange: async (startDate: Date, endDate: Date, limit = 100) => {
    try {
      const result = await localDb.allDocs({
        include_docs: true,
        startkey: 'sales:',
        endkey: 'sales:\ufff0',
        limit
      });
      
      return result.rows
        .map(row => row.doc as Sale)
        .filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= startDate && saleDate <= endDate;
        });
    } catch (error) {
      console.error('Failed to load sales by date range:', error);
      return [];
    }
  }
}));