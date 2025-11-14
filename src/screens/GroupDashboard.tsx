import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { formatCurrency } from '../utils/settlements';
import ManageMembers from '../components/forms/ManageMembers';
import ActivityFeed from '../components/ActivityFeed';
import QuickAddExpense from '../components/QuickAddExpense';
import CategoryBadge from '../components/CategoryBadge';
import SpendingInsights from '../components/SpendingInsights';
import { exportToCSV, exportToPDF, exportSettlementsToCSV } from '../services/exportService';
import NotificationSettings from '../components/NotificationSettings';

const GroupDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { currentGroup, balances, loadGroups, initializeActiveGroup } = useGroupStore();
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load groups and initialize active group
    loadGroups();
    initializeActiveGroup();
  }, [loadGroups, initializeActiveGroup]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

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
    <div style={{ backgroundColor: '#f9fafb', paddingBottom: '24px' }}>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Export Button */}
            <div ref={exportMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#14b8a6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                📥 Export
              </button>

              {/* Export Dropdown */}
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  zIndex: 50,
                  minWidth: '220px'
                }}>
                  {/* Header */}
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    ALL TIME
                  </div>
                  <button
                    onClick={() => {
                      if (currentGroup) exportToCSV(currentGroup);
                      setShowExportMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1f2937'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    📄 CSV - All Expenses
                  </button>
                  <button
                    onClick={() => {
                      if (currentGroup) exportToPDF(currentGroup);
                      setShowExportMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1f2937',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    📑 PDF - All Expenses
                  </button>

                  {/* Last 30 Days */}
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    LAST 30 DAYS
                  </div>
                  <button
                    onClick={() => {
                      if (currentGroup) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 30);
                        exportToCSV(currentGroup, { start, end });
                      }
                      setShowExportMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1f2937'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    📄 CSV - Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      if (currentGroup) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 30);
                        exportToPDF(currentGroup, { start, end });
                      }
                      setShowExportMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1f2937',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    📑 PDF - Last 30 Days
                  </button>

                  {/* Settlements */}
                  <button
                    onClick={() => {
                      if (currentGroup) exportSettlementsToCSV(currentGroup);
                      setShowExportMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1f2937'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    💰 Settlements CSV
                  </button>
                </div>
              )}
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
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#14b8a6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Switch Group
            </button>
          </div>
        </div>
      </div>

      {/* Balance Summary - Enhanced with gradient */}
      <div style={{
        background: isEven
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : isOwed
            ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
            : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circles */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(30px)'
        }} />

        <div style={{ textAlign: 'center', maxWidth: '448px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Overall Balance
          </p>
          <div style={{ marginBottom: '8px' }}>
            {isEven ? (
              <div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  marginBottom: '8px'
                }}>
                  ✓
                </div>
                <span style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                  All Settled Up!
                </span>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: '8px',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  You are {isOwed ? 'owed' : 'owing'}
                </p>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  letterSpacing: '-1px',
                  fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }}>
                  {formatCurrency(Math.abs(netAmount), currentGroup?.baseCurrency || 'SGD')}
                </div>
              </div>
            )}
          </div>

          {/* Quick action hint */}
          <div style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            display: 'inline-block'
          }}>
            <p style={{
              fontSize: '13px',
              color: 'white',
              margin: 0,
              fontWeight: '500'
            }}>
              {isEven ? '🎉 Great job!' : isOwed ? '💰 Collect payments' : '💸 Settle your balance'}
            </p>
          </div>
        </div>
      </div>

      {/* Spending Insights */}
      <div style={{
        margin: '24px 16px',
        maxWidth: '448px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <SpendingInsights group={currentGroup} userId={currentUser?.id} />
      </div>

      {/* Notification Settings */}
      <div style={{
        margin: '24px 16px',
        maxWidth: '448px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <NotificationSettings />
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{expense.description}</p>
                        {expense.category && <CategoryBadge categoryId={expense.category} size="small" showLabel={false} />}
                      </div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
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

      {/* Activity Feed */}
      <div style={{
        margin: '24px 16px 100px',
        maxWidth: '448px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {currentGroup && <ActivityFeed group={currentGroup} limit={8} />}
      </div>

      {/* Quick Add Expense Button */}
      <div style={{ position: 'fixed', bottom: '80px', right: '24px' }}>
        <button
          onClick={() => setShowQuickAdd(true)}
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

      {/* Modals */}
      <ManageMembers
        isOpen={showManageMembers}
        onClose={() => setShowManageMembers(false)}
      />
      <QuickAddExpense
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </div>
  );
};

export default GroupDashboard;