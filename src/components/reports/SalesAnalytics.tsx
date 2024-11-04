import React from 'react';
import { useSalesStore } from '../../lib/stores/useSalesStore';
import { TrendingUp, DollarSign, CreditCard, ShoppingCart } from 'lucide-react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface SalesAnalyticsProps {
  dateRange: {
    start: string;
    end: string;
  };
}

export default function SalesAnalytics({ dateRange }: SalesAnalyticsProps) {
  const { sales, getSalesByDateRange } = useSalesStore();
  const [periodSales, setPeriodSales] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPeriodSales = async () => {
      setIsLoading(true);
      try {
        const salesData = await getSalesByDateRange(dateRange.start, dateRange.end);
        setPeriodSales(salesData || []);
      } catch (error) {
        console.error('Error loading sales data:', error);
        setPeriodSales([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadPeriodSales();
  }, [dateRange, getSalesByDateRange]);

  const totalRevenue = periodSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const averageOrderValue = periodSales.length > 0 ? totalRevenue / periodSales.length : 0;
  const totalOrders = periodSales.length;

  const paymentMethodStats = periodSales.reduce((acc: Record<string, number>, sale) => {
    const method = sale.paymentMethod || 'Unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const mostUsedPayment = Object.entries(paymentMethodStats).reduce((a, b) => 
    (a[1] || 0) > (b[1] || 0) ? a : b, ['None', 0]
  )[0];

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      name: 'Average Order Value',
      value: `$${averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
    },
    {
      name: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
    },
    {
      name: 'Most Used Payment',
      value: mostUsedPayment,
      icon: CreditCard,
    },
  ];

  const dailyRevenue = React.useMemo(() => {
    try {
      return eachDayOfInterval({
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end),
      }).map(date => {
        const daySales = periodSales.filter(sale => 
          format(new Date(sale.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          date: format(date, 'MMM dd'),
          revenue: daySales.reduce((sum, sale) => sum + (sale.total || 0), 0),
        };
      });
    } catch (error) {
      console.error('Error calculating daily revenue:', error);
      return [];
    }
  }, [dateRange, periodSales]);

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Revenue</h3>
        {dailyRevenue.length > 0 ? (
          <div className="h-64">
            <div className="h-full flex items-end space-x-2">
              {dailyRevenue.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 bg-indigo-100 rounded-t relative group"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all duration-200 group-hover:bg-indigo-600"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        ${day.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 -mb-6 transform -rotate-45 origin-left">
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No sales data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}