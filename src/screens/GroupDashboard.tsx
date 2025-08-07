import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { formatCurrency } from '../utils/settlements';
import ManageMembers from '../components/forms/ManageMembers';

const GroupDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { currentGroup, balances, loadGroups, initializeActiveGroup } = useGroupStore();
  const [showManageMembers, setShowManageMembers] = useState(false);

  useEffect(() => {
    // Load groups and initialize active group
    loadGroups();
    initializeActiveGroup();
  }, [loadGroups, initializeActiveGroup]);

  const currentUserBalance = balances.find(b => b.userId === currentUser?.id);
  const recentExpenses = currentGroup?.expenses.slice(-3) || [];
  const hasActiveGroup = Boolean(currentGroup);

  if (!hasActiveGroup) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ 
            width: '96px', 
            height: '96px', 
            margin: '0 auto 32px', 
            borderRadius: '50%', 
            backgroundColor: '#e5e7eb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <svg style={{ width: '48px', height: '48px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '300', color: '#1f2937', marginBottom: '12px' }}>No Active Group</h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>Select or create a group to start tracking shared expenses</p>
          
          <button
            onClick={() => navigate('/groups')}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
          >
            Manage Groups
          </button>
        </div>
      </div>
    );
  }

  const netAmount = currentUserBalance?.netAmount || 0;
  const isOwed = netAmount > 0;
  const owes = netAmount < 0;
  const isEven = netAmount === 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '448px', margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
              {currentGroup?.name}
            </h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              {currentGroup?.members?.filter(m => m.isActive).length || 0} members • {currentGroup?.baseCurrency}
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#14b8a6';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            Switch Group
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'center', maxWidth: '448px', margin: '0 auto' }}>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>overall, you are</p>
          <div style={{ marginBottom: '16px' }}>
            {isEven ? (
              <span style={{ fontSize: '24px', fontWeight: '300', color: '#374151' }}>settled up</span>
            ) : (
              <div>
                <span style={{ 
                  fontSize: '24px', 
                  fontWeight: '300', 
                  color: isOwed ? '#14b8a6' : '#f97316' 
                }}>
                  {isOwed ? 'owed' : 'owe'}
                </span>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '300', 
                  marginTop: '4px', 
                  color: isOwed ? '#14b8a6' : '#f97316' 
                }}>
                  {formatCurrency(Math.abs(netAmount), currentGroup?.baseCurrency || 'SGD')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div style={{ 
        backgroundColor: 'white', 
        margin: '24px 16px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        border: '1px solid #e5e7eb',
        maxWidth: '448px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #f3f4f6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <h3 style={{ fontWeight: '500', color: '#1f2937' }}>
            Members ({currentGroup?.members?.filter(m => m.isActive).length || 0})
          </h3>
          <button 
            onClick={() => setShowManageMembers(true)}
            style={{
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Manage
          </button>
        </div>
        
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentGroup?.members?.filter(m => m.isActive).slice(0, 4).map(member => {
              const memberBalance = balances.find(b => b.userId === member.userId);
              const netAmount = memberBalance?.netAmount || 0;
              const isCurrentUser = member.userId === currentUser?.id;
              
              return (
                <div key={member.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: '#e5e7eb', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#6b7280'
                    }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                        {member.name}
                        {isCurrentUser && <span style={{ color: '#6b7280', marginLeft: '4px' }}>(you)</span>}
                        {member.userId === currentGroup?.createdBy && (
                          <span style={{ color: '#14b8a6', fontSize: '12px', marginLeft: '4px' }}>creator</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: netAmount > 0 ? '#14b8a6' : netAmount < 0 ? '#f97316' : '#6b7280',
                      margin: 0
                    }}>
                      {netAmount > 0 ? '+' : ''}{formatCurrency(netAmount, currentGroup?.baseCurrency || 'SGD')}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {(currentGroup?.members?.filter(m => m.isActive).length || 0) > 4 && (
              <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                <button
                  onClick={() => setShowManageMembers(true)}
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  +{(currentGroup?.members?.filter(m => m.isActive).length || 0) - 4} more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div style={{ 
        backgroundColor: 'white', 
        margin: '24px 16px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        border: '1px solid #e5e7eb',
        maxWidth: '448px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #f3f4f6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <h3 style={{ fontWeight: '500', color: '#1f2937' }}>Recent expenses</h3>
          <button 
            onClick={() => navigate('/expenses')}
            style={{
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            See all
          </button>
        </div>
        
        {recentExpenses.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
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
              <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
          <div>
            {recentExpenses.map((expense, index) => {
              const paidByMember = currentGroup?.members.find(m => m.userId === expense.paidBy);
              const userSplit = expense.splits.find(split => split.userId === currentUser?.id);
              const userShare = userSplit ? userSplit.amount : 0;
              const isLast = index === recentExpenses.length - 1;
              
              return (
                <div 
                  key={expense.id} 
                  style={{ 
                    padding: '12px 16px',
                    borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/expenses')}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: '1' }}>
                      <p style={{ fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>{expense.description}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {paidByMember?.name || 'Someone'} paid {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>you {expense.paidBy === currentUser?.id ? 'lent' : 'owe'}</div>
                      <div style={{ 
                        fontWeight: '500', 
                        color: expense.paidBy === currentUser?.id ? '#14b8a6' : '#f97316' 
                      }}>
                        {formatCurrency(expense.paidBy === currentUser?.id ? expense.amount - userShare : userShare, expense.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Button */}
      <div style={{ position: 'fixed', bottom: '80px', right: '24px' }}>
        <button
          onClick={() => navigate('/add-expense')}
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Manage Members Modal */}
      <ManageMembers
        isOpen={showManageMembers}
        onClose={() => setShowManageMembers(false)}
      />
    </div>
  );
};

export default GroupDashboard;