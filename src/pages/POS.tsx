import React from 'react';
import { useOrderStore } from '../lib/stores/useOrderStore';
import { useInventoryStore } from '../lib/stores/useInventoryStore';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function POS() {
  const { products, loadProducts } = useInventoryStore();
  const { createOrder } = useOrderStore();
  const [cart, setCart] = React.useState<Array<{ product: any; quantity: number }>>([]);
  const [tableNumber, setTableNumber] = React.useState<string>("1");
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

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

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    await createOrder({
      items: cart.map(item => ({
        product_id: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      table_number: parseInt(tableNumber),
      total,
      status: 'pending'
    });

    setCart([]);
  };

  const handleTableNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTableNumber(value);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      <div className="flex-1 flex flex-col">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {filteredProducts.map(product => (
            <button
              key={product._id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="text-left">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="mt-2 text-indigo-600 font-semibold">${product.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-96 bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Table Number</label>
          <input
            type="text"
            pattern="\d*"
            value={tableNumber}
            onChange={handleTableNumberChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.map(item => (
            <div key={item.product._id} className="flex items-center justify-between py-2">
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

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Total</span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}