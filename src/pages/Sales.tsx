import React from 'react';
import { useInventoryStore } from '../lib/stores/useInventoryStore';
import { useSalesStore } from '../lib/stores/useSalesStore';
import { Search, Plus, Minus, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';

export default function Sales() {
  const { products, loadProducts } = useInventoryStore();
  const { createSale } = useSalesStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [cart, setCart] = React.useState<Array<{ product: any; quantity: number }>>([]);
  const [discount, setDiscount] = React.useState(0);
  const [paymentReceived, setPaymentReceived] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState('cash');

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, paymentReceived - total);

  const addToCart = (product: any) => {
    setCart(current => {
      const existing = current.find(item => item.product._id === product._id);
      if (existing) {
        return current.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(current =>
      current.map(item =>
        item.product._id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0 || paymentReceived < total) return;

    const saleData = {
      items: cart.map(item => ({
        product_id: item.product._id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      subtotal,
      discount,
      total,
      paymentMethod,
      paymentReceived,
      change,
      date: new Date().toISOString()
    };

    try {
      await createSale(saleData);
      generateReceipt();
      setCart([]);
      setDiscount(0);
      setPaymentReceived(0);
      setPaymentMethod('cash');
    } catch (error) {
      console.error('Failed to complete sale:', error);
      alert('Failed to complete sale. Please try again.');
    }
  };

  const generateReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const receiptContent = `
      <html>
        <head>
          <title>Sales Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { margin: 5px 0; }
            .total { margin-top: 10px; border-top: 1px solid #000; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Delux Bar & Fast-Food</h2>
            <p>${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          </div>
          <div class="items">
            ${cart.map(item => `
              <div class="item">
                ${item.quantity}x ${item.product.name}
                $${(item.product.price * item.quantity).toFixed(2)}
              </div>
            `).join('')}
          </div>
          <div class="total">
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Discount: $${discount.toFixed(2)}</p>
            <p>Total: $${total.toFixed(2)}</p>
            <p>Payment (${paymentMethod}): $${paymentReceived.toFixed(2)}</p>
            <p>Change: $${change.toFixed(2)}</p>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 flex gap-6">
        <div className="w-2/3 flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                placeholder="Search products..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredProducts.map(product => (
              <button
                key={product._id}
                onClick={() => addToCart(product)}
                className="w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex justify-between items-center"
              >
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <p className="text-indigo-600 font-semibold">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Current Sale</h2>
          
          <div className="flex-1 overflow-y-auto">
            {cart.map(item => (
              <div key={item.product._id} className="flex items-center justify-between py-2 border-b">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, -1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateQuantity(item.product._id, -item.quantity)}
                    className="p-1 rounded-full hover:bg-gray-100 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Received</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentReceived}
                onChange={(e) => setPaymentReceived(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Discount:</span>
                <span>${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Change:</span>
                <span>${change.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || paymentReceived < total}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}