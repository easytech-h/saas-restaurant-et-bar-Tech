import React from 'react';
import { useSalesStore } from '../../lib/stores/useSalesStore';
import { Search, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useInventoryStore } from '../../lib/stores/useInventoryStore';

interface SalesHistoryProps {
  dateRange: {
    start: string;
    end: string;
  };
}

export default function SalesHistory({ dateRange }: SalesHistoryProps) {
  const { sales, loadSales } = useSalesStore();
  const { products, loadProducts } = useInventoryStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState({
    key: 'date',
    direction: 'desc'
  });

  React.useEffect(() => {
    loadSales();
    loadProducts();
  }, [loadSales, loadProducts]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : productId;
  };

  const filteredSales = sales
    .filter(sale => {
      const saleDate = format(new Date(sale.date), 'yyyy-MM-dd');
      return saleDate >= dateRange.start && saleDate <= dateRange.end;
    })
    .filter(sale =>
      sale._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some(item => 
        getProductName(item.product_id).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortConfig.key === 'total' || sortConfig.key === 'subtotal') {
      const aValue = sortConfig.key === 'total' ? a.total : (a.subtotal || a.total);
      const bValue = sortConfig.key === 'total' ? b.total : (b.subtotal || b.total);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search sales..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('subtotal')}
              >
                <div className="flex items-center">
                  Subtotal
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center">
                  Total
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSales.map((sale) => {
              const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const discount = subtotal - sale.total;
              
              return (
                <tr key={sale._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{sale._id.split(':')[1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(sale.date), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {sale.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {getProductName(item.product_id)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${subtotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${discount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${sale.total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}