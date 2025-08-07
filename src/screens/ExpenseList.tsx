import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EditExpense from '../components/forms/EditExpense';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { Expense } from '../types';
import { formatCurrency } from '../utils/settlements';

type FilterType = 'all' | 'pending' | 'settled';
type SortType = 'date' | 'amount' | 'description';

const ExpenseList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { currentGroup, deleteExpense, recalculateAll } = useGroupStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const categories = [
    { value: 'all', label: '🔍 All Categories' },
    { value: 'food', label: '🍕 Food & Dining' },
    { value: 'transport', label: '🚗 Transportation' },
    { value: 'accommodation', label: '🏨 Accommodation' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'shopping', label: '🛍️ Shopping' },
    { value: 'utilities', label: '⚡ Utilities' },
    { value: 'general', label: '📝 General' }
  ];

  const filteredAndSortedExpenses = useMemo(() => {
    if (!currentGroup) return [];
    
    let expenses = [...currentGroup.expenses];
    
    // Filter by search term
    if (searchTerm) {
      expenses = expenses.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      expenses = expenses.filter(expense => expense.category === selectedCategory);
    }
    
    // Filter by settlement status (for future implementation)
    // if (filterType !== 'all') {
    //   expenses = expenses.filter(expense => {
    //     return filterType === 'settled' ? expense.settled : !expense.settled;
    //   });
    // }
    
    // Sort expenses
    expenses.sort((a, b) => {
      let comparison = 0;
      
      switch (sortType) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.baseCurrencyAmount - b.baseCurrencyAmount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return expenses;
  }, [currentGroup, searchTerm, filterType, selectedCategory, sortType, sortDirection]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentGroup) return;
    
    try {
      await deleteExpense(expenseId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleRecalculate = () => {
    if (!currentGroup) return;
    
    setIsRecalculating(true);
    try {
      recalculateAll(currentGroup.id);
      setTimeout(() => setIsRecalculating(false), 1000); // Give visual feedback
    } catch (error) {
      console.error('Failed to recalculate:', error);
      setIsRecalculating(false);
    }
  };

  const toggleSort = (newSortType: SortType) => {
    if (sortType === newSortType) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(newSortType);
      setSortDirection('desc');
    }
  };

  const getUserShare = (expense: Expense) => {
    if (!currentUser) return 0;
    const userSplit = expense.splits.find(split => split.userId === currentUser.id);
    return userSplit ? userSplit.amount : 0;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getTotalExpenses = () => {
    return filteredAndSortedExpenses.reduce((total, expense) => total + expense.baseCurrencyAmount, 0);
  };

  const getUserTotalShare = () => {
    return filteredAndSortedExpenses.reduce((total, expense) => total + getUserShare(expense), 0);
  };

  if (!currentGroup || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-body-medium text-secondary">No active group</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '448px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>All Expenses</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              style={{
                padding: '8px 12px',
                backgroundColor: isRecalculating ? '#9ca3af' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isRecalculating ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isRecalculating) e.target.style.backgroundColor = '#4b5563';
              }}
              onMouseOut={(e) => {
                if (!isRecalculating) e.target.style.backgroundColor = '#6b7280';
              }}
            >
              {isRecalculating ? '⏳ Recalc...' : '🔄 Recalculate'}
            </button>
            <button
              onClick={() => navigate('/add-expense')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ padding: '16px', maxWidth: '448px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px', 
          marginBottom: '16px' 
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>TOTAL EXPENSES</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              {formatCurrency(getTotalExpenses(), currentGroup.baseCurrency)}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>YOUR SHARE</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#14b8a6' }}>
              {formatCurrency(getUserTotalShare(), currentGroup.baseCurrency)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '0 16px', maxWidth: '448px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              outline: 'none',
              marginBottom: '16px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          
          {/* Filter Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Options */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                Sort by
              </label>
              <select
                value={`${sortType}_${sortDirection}`}
                onChange={(e) => {
                  const [type, direction] = e.target.value.split('_');
                  setSortType(type as SortType);
                  setSortDirection(direction as 'asc' | 'desc');
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="date_desc">📅 Newest first</option>
                <option value="date_asc">📅 Oldest first</option>
                <option value="amount_desc">💰 Highest amount</option>
                <option value="amount_asc">💰 Lowest amount</option>
                <option value="description_asc">📝 A to Z</option>
                <option value="description_desc">📝 Z to A</option>
              </select>
            </div>
          </div>
          
          {/* Filter Summary */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#f0fdfa', borderRadius: '6px', border: '1px solid #14b8a6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#14b8a6', fontWeight: '500' }}>
                  {filteredAndSortedExpenses.length} expense{filteredAndSortedExpenses.length !== 1 ? 's' : ''} found
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    fontSize: '12px',
                    color: '#14b8a6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear filters
                </button>
              </div>
              {searchTerm && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Searching: "{searchTerm}"
                </div>
              )}
              {selectedCategory !== 'all' && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Category: {categories.find(c => c.value === selectedCategory)?.label}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expenses List */}
        {filteredAndSortedExpenses.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto 16px', 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>No expenses yet</p>
            <button
              onClick={() => navigate('/add-expense')}
              style={{
                color: '#14b8a6',
                fontWeight: '500',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAndSortedExpenses.map((expense) => {
              const paidByMember = currentGroup.members.find(m => m.userId === expense.paidBy);
              const userShare = getUserShare(expense);
              const isPaidByCurrentUser = expense.paidBy === currentUser.id;
              
              return (
                <div key={expense.id} style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}>
                  {/* Expense Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                          {expense.description}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            backgroundColor: '#e5e7eb', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: '500',
                            color: '#6b7280'
                          }}>
                            {(paidByMember?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                            {paidByMember?.name || 'Someone'} paid • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            {formatCurrency(expense.amount, expense.currency)}
                          </p>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            margin: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {getCategoryLabel(expense.category)}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button
                            onClick={() => setEditingExpense(expense)}
                            style={{
                              padding: '4px 6px',
                              backgroundColor: 'transparent',
                              color: '#14b8a6',
                              border: '1px solid #14b8a6',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#f0fdfa';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                            title="Edit expense"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(expense.id)}
                            style={{
                              padding: '4px 6px',
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#fef2f2';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                            title="Delete expense"
                          >
                            🗑️ Del
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member Shares */}
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {expense.splits.map((split) => {
                        const member = currentGroup.members.find(m => m.userId === split.userId);
                        const isCurrentUser = split.userId === currentUser.id;
                        const isPayer = split.userId === expense.paidBy;
                        
                        return (
                          <div key={split.userId} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '6px 0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%', 
                                backgroundColor: isCurrentUser ? '#14b8a6' : '#e5e7eb',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '500',
                                color: isCurrentUser ? 'white' : '#6b7280'
                              }}>
                                {(member?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#1f2937',
                                fontWeight: isCurrentUser ? '500' : '400'
                              }}>
                                {member?.name || 'Unknown'}
                                {isCurrentUser && <span style={{ color: '#6b7280' }}> (you)</span>}
                                {isPayer && <span style={{ color: '#14b8a6', fontSize: '12px' }}> • paid</span>}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: '500',
                                color: isPayer ? '#14b8a6' : '#f97316'
                              }}>
                                {isPayer ? '+' : '-'}{formatCurrency(split.amount, expense.currency)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Your Balance for this expense */}
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #f3f4f6',
                      backgroundColor: isPaidByCurrentUser ? '#f0fdfa' : '#fef3f2',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      margin: '0 -4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                          Your net: {isPaidByCurrentUser ? 'You lent' : 'You owe'}
                        </span>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: isPaidByCurrentUser ? '#14b8a6' : '#f97316'
                        }}>
                          {formatCurrency(isPaidByCurrentUser ? expense.amount - userShare : userShare, expense.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      <EditExpense
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '16px',
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '320px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Delete expense
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExpense(showDeleteConfirm)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;