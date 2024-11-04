import React from 'react';
import { useOrderStore } from '../lib/stores/useOrderStore';
import { Clock, CheckCircle } from 'lucide-react';

export default function Kitchen() {
  const { activeOrders, loadActiveOrders, updateOrderStatus } = useOrderStore();

  React.useEffect(() => {
    loadActiveOrders();
    const interval = setInterval(loadActiveOrders, 30000);
    return () => clearInterval(interval);
  }, [loadActiveOrders]);

  const pendingOrders = activeOrders.filter(order => order.status === 'pending');
  const preparingOrders = activeOrders.filter(order => order.status === 'preparing');

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
  };

  const OrderCard = ({ order }: { order: any }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">Order #{order._id.split(':')[1]}</h3>
          <p className="text-sm text-gray-500">Table {order.table_number}</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {new Date(order.created_at).toLocaleTimeString()}
        </div>
      </div>

      <ul className="divide-y divide-gray-200">
        {order.items?.map((item: any, index: number) => (
          <li key={index} className="py-3">
            <div className="flex justify-between">
              <span className="font-medium">{item.quantity}x {item.product_id}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end space-x-2">
        {order.status === 'pending' && (
          <button
            onClick={() => handleStatusUpdate(order._id, 'preparing')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => handleStatusUpdate(order._id, 'completed')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Complete Order
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Pending Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Preparing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preparingOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}