import React from 'react';
import { useInventoryStore } from '../../lib/stores/useInventoryStore';
import { useSalesStore } from '../../lib/stores/useSalesStore';
import { DollarSign, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export default function PriceManagement() {
  const { products } = useInventoryStore();
  const { sales } = useSalesStore();
  const [expenses, setExpenses] = React.useState<Expense[]>([
    { id: '1', description: 'Utilities', amount: 500, date: new Date().toISOString() },
    { id: '2', description: 'Rent', amount: 1200, date: new Date().toISOString() },
    { id: '3', description: 'Staff Wages', amount: 2500, date: new Date().toISOString() }
  ]);
  const [newExpense, setNewExpense] = React.useState({ description: '', amount: '' });

  const totalPurchasePrice = products.reduce((sum, product) => 
    sum + (product.cost * product.stock), 0
  );

  const totalPotentialSales = products.reduce((sum, product) => 
    sum + (product.price * product.stock), 0
  );

  const netTotal = totalPotentialSales - totalPurchasePrice;

  const actualSalesTotal = sales.reduce((sum, sale) => sum + sale.total, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const finalNetTotal = actualSalesTotal - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description && newExpense.amount) {
      setExpenses(prev => [...prev, {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString()
      }]);
      setNewExpense({ description: '', amount: '' });
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Purchase Price Total</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">${totalPurchasePrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Potential Sales Total</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">${totalPotentialSales.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ArrowUp className="h-8 w-8 text-indigo-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Total (Potential)</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">${netTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ArrowDown className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actual Sales Total</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">${actualSalesTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses Management</h3>
          
          <form onSubmit={handleAddExpense} className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Expense description"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Amount"
              className="w-full sm:w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Expense
            </button>
          </form>

          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                      Total Expenses
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                      ${totalExpenses.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="bg-indigo-50">
                    <td colSpan={2} className="px-4 sm:px-6 py-4 text-sm font-medium text-indigo-900">
                      Final Net Total (After Expenses)
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-indigo-900">
                      ${finalNetTotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}