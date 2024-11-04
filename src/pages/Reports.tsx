import React from 'react';
import { useSalesStore } from '../lib/stores/useSalesStore';
import { DownloadIcon, Printer } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import jsPDF from 'jspdf';
import StatsCard from '../components/reports/StatsCard';
import SalesTable from '../components/reports/SalesTable';
import PriceManagement from '../components/reports/PriceManagement';
import { Sale } from '../types/sales';

export default function Reports() {
  const { sales, loadSales } = useSalesStore();
  const [dateRange, setDateRange] = React.useState('week');
  const [showPriceManagement, setShowPriceManagement] = React.useState(false);

  React.useEffect(() => {
    loadSales();
  }, [loadSales]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: now, end: now };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: now, end: now };
    }
  };

  const filteredSales: Sale[] = (sales || []).filter(sale => {
    const saleDate = new Date(sale.date);
    const { start, end } = getDateRange();
    return saleDate >= start && saleDate <= end;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const averageOrder = totalSales / (filteredSales.length || 1);
  const totalOrders = filteredSales.length;
  const totalItems = filteredSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = `Sales Report - ${format(getDateRange().start, 'PP')} to ${format(getDateRange().end, 'PP')}`;
    
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 20, 40);
    doc.text(`Average Order: $${averageOrder.toFixed(2)}`, 20, 50);
    doc.text(`Total Orders: ${totalOrders}`, 20, 60);
    doc.text(`Total Items Sold: ${totalItems}`, 20, 70);
    
    let y = 90;
    filteredSales.forEach((sale, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`Sale #${index + 1} - ${format(new Date(sale.date), 'Pp')}`, 20, y);
      y += 10;
      sale.items.forEach(item => {
        doc.text(`${item.quantity}x ${item.product_name} - $${(item.price * item.quantity).toFixed(2)}`, 30, y);
        y += 10;
      });
      doc.text(`Total: $${(sale.total || 0).toFixed(2)}`, 30, y);
      y += 15;
    });
    
    doc.save('sales-report.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = [
    {
      name: 'Total Sales',
      value: `$${totalSales.toFixed(2)}`,
      change: '+12.5%',
      changeType: 'increase' as const
    },
    {
      name: 'Average Order Value',
      value: `$${averageOrder.toFixed(2)}`,
      change: '+2.3%',
      changeType: 'increase' as const
    },
    {
      name: 'Total Orders',
      value: totalOrders.toString(),
      change: '+5.4%',
      changeType: 'increase' as const
    },
    {
      name: 'Items Sold',
      value: totalItems.toString(),
      change: '+8.1%',
      changeType: 'increase' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
              <div>
                <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <select
                  id="date-range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowPriceManagement(!showPriceManagement)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showPriceManagement ? 'Hide' : 'Show'} Price Management
              </button>
              <button
                onClick={generatePDF}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
          </div>

          {showPriceManagement && (
            <div className="mt-6">
              <PriceManagement />
            </div>
          )}

          <div className="mt-6">
            <SalesTable sales={filteredSales} />
          </div>
        </div>
      </div>
    </div>
  );
}