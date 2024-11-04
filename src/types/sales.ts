export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  _id: string;
  date: string;
  items: SaleItem[];
  discount: number;
  subtotal: number;
  total: number;
}