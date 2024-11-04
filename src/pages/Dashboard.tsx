import React from 'react';
import { useOrderStore } from '../lib/stores/useOrderStore';
import { useInventoryStore } from '../lib/stores/useInventoryStore';
import { useSalesStore } from '../lib/stores/useSalesStore';
import { TrendingUp, Users, ShoppingBag, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { orders, loading: ordersLoading, loadOrders } = useOrderStore();
  const { products, loading: productsLoading, loadProducts } = useInventoryStore();
  const { sales, loading: salesLoading, loadSales } = useSalesStore();
  const [todayRevenue, setTodayRevenue] = React.useState(0);

  React.useEffect(() => {
    loadOrders();
    loadProducts();
    loadSales();

    // Calculate today's revenue from completed sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales?.filter(sale => 
      sale.date.startsWith(today)
    ) || [];
    
    const revenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    setTodayRevenue(revenue);
  }, [loadOrders, loadProducts, loadSales, sales]);

  if (ordersLoading || productsLoading || salesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeOrders = orders?.filter(order => 
    order.status !== 'completed' && order.status !== 'cancelled'
  ) || [];

  const lowStockItems = products?.filter(product => 
    product.stock <= product.min_stock
  ) || [];

  const stats = [
    {
      name: "Today's Revenue",
      value: `$${todayRevenue.toFixed(2)}`,
      icon: TrendingUp,
      change: '+12.5%',
      changeType: 'increase'
    },
    {
      name: 'Active Orders',
      value: activeOrders.length,
      icon: ShoppingBag,
      change: '+4.75%',
      changeType: 'increase'
    },
    {
      name: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      change: '-1.5%',
      changeType: 'decrease'
    },
    {
      name: 'Active Tables',
      value: '12/15',
      icon: Users,
      change: '+2.3%',
      changeType: 'increase'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {activeOrders.slice(0, 5).map((order) => (
                <li key={order._id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Order #{order._id.split(':')[1]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer_name} • {order.status}
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm font-semibold text-indigo-600">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
              {activeOrders.length === 0 && (
                <li className="py-4 text-sm text-gray-500 text-center">
                  No active orders
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {lowStockItems.slice(0, 5).map((item) => (
                <li key={item._id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Current stock: {item.stock} (Min: {item.min_stock})
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm font-semibold text-red-600">
                      Reorder
                    </div>
                  </div>
                </li>
              ))}
              {lowStockItems.length === 0 && (
                <li className="py-4 text-sm text-gray-500 text-center">
                  No low stock items
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}