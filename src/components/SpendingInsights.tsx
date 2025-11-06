import React, { useMemo } from 'react';
import { Group, Expense } from '../types';
import { getCategoryConfig, EXPENSE_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/settlements';

interface SpendingInsightsProps {
  group: Group;
  userId?: string;
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({ group, userId }) => {
  const insights = useMemo(() => {
    // Get expenses from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentExpenses = group.expenses.filter(expense =>
      new Date(expense.date) >= thirtyDaysAgo
    );

    // Total spending
    const totalSpending = recentExpenses.reduce((sum, exp) => sum + exp.baseCurrencyAmount, 0);

    // User's spending
    const userSpending = userId ? recentExpenses.reduce((sum, exp) => {
      if (exp.paidBy === userId) {
        return sum + exp.baseCurrencyAmount;
      }
      return sum;
    }, 0) : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    recentExpenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.baseCurrencyAmount;
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 categories

    // Top 3 expenses
    const topExpenses = [...recentExpenses]
      .sort((a, b) => b.baseCurrencyAmount - a.baseCurrencyAmount)
      .slice(0, 3);

    // Average expense
    const avgExpense = recentExpenses.length > 0 ? totalSpending / recentExpenses.length : 0;

    return {
      totalSpending,
      userSpending,
      categoryTotals: sortedCategories,
      topExpenses,
      avgExpense,
      expenseCount: recentExpenses.length
    };
  }, [group.expenses, userId]);

  if (insights.expenseCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-600 text-sm">Add some expenses to see spending insights!</p>
        </div>
      </div>
    );
  }

  const maxCategoryAmount = Math.max(...insights.categoryTotals.map(([, amount]) => amount));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Total (30 days)</p>
          <p className="text-2xl font-semibold">{formatCurrency(insights.totalSpending, group.baseCurrency)}</p>
          <p className="text-xs opacity-75 mt-1">{insights.expenseCount} expenses</p>
        </div>

        {userId && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <p className="text-xs opacity-90 mb-1">You Spent</p>
            <p className="text-2xl font-semibold">{formatCurrency(insights.userSpending, group.baseCurrency)}</p>
            <p className="text-xs opacity-75 mt-1">
              {insights.userSpending > 0 ? Math.round((insights.userSpending / insights.totalSpending) * 100) : 0}% of total
            </p>
          </div>
        )}

        {!userId && (
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-xs opacity-90 mb-1">Average</p>
            <p className="text-2xl font-semibold">{formatCurrency(insights.avgExpense, group.baseCurrency)}</p>
            <p className="text-xs opacity-75 mt-1">per expense</p>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
        <div className="space-y-3">
          {insights.categoryTotals.map(([categoryId, amount]) => {
            const category = getCategoryConfig(categoryId);
            const percentage = (amount / insights.totalSpending) * 100;
            const barWidth = (amount / maxCategoryAmount) * 100;

            return (
              <div key={categoryId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span style={{ fontSize: '16px' }}>{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{category.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(amount, group.baseCurrency)}
                    </p>
                    <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biggest Expenses</h3>
        <div className="space-y-3">
          {insights.topExpenses.map((expense, index) => {
            const category = getCategoryConfig(expense.category || 'other');
            const paidBy = group.members.find(m => m.userId === expense.paidBy);

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-xs text-gray-600">
                      {paidBy?.name || 'Someone'} • {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(expense.baseCurrencyAmount, group.baseCurrency)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpendingInsights;
