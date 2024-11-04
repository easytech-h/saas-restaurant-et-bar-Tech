import { localDb } from './index';
import { DatabaseDocument } from './types';

const sampleProducts: DatabaseDocument[] = [
  {
    _id: 'products:1',
    name: 'Classic Burger',
    category: 'Burgers',
    price: 12.99,
    cost: 4.50,
    stock: 50,
    min_stock: 20
  },
  {
    _id: 'products:2',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 14.99,
    cost: 5.00,
    stock: 40,
    min_stock: 15
  }
];

export async function initializeData(): Promise<boolean> {
  try {
    const existing = await localDb.allDocs({
      startkey: 'products:',
      endkey: 'products:\ufff0'
    });

    if (existing.rows.length === 0) {
      await Promise.all(sampleProducts.map(item => localDb.put(item)));
      console.log('Sample data initialized');
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize data:', error);
    return false;
  }
}