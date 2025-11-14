import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { formatCurrency, isGroupSettled, calculateOptimalPayments } from '../utils/settlements';
import { SettlementStatus } from '../types';
import Confetti from '../components/Confetti';

const SettlementView: React.FC = () => {
  const { currentUser } = useAppStore();
  const { 
    currentGroup, 
    balances, 
    isCalculatingSettlements,
    calculateSettlements,
    recalculateAll,
    markSettlementPaid,
    refreshBalancesByCurrency
  } = useGroupStore();

  const [processingPayments, setProcessingPayments] = React.useState<Set<string>>(new Set());
  const [optimalPaymentsByCurrency, setOptimalPaymentsByCurrency] = React.useState<Record<string, any[]>>({});
  const [simplifiedSettlements, setSimplifiedSettlements] = React.useState<any[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = React.useState<string[]>([]);
  const [selectedSettlementCurrency, setSelectedSettlementCurrency] = React.useState<string>('');
  const [showSimplified, setShowSimplified] = React.useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Simple currency conversion rates (in a real app, this would be fetched from an API)
  const exchangeRates: Record<string, Record<string, number>> = {
    USD: { SGD: 1.35, MYR: 4.65, CNY: 7.25, EUR: 0.92, GBP: 0.79, JPY: 148 },
    SGD: { USD: 0.74, MYR: 3.45, CNY: 5.37, EUR: 0.68, GBP: 0.59, JPY: 109.8 },
    MYR: { USD: 0.215, SGD: 0.29, CNY: 1.56, EUR: 0.20, GBP: 0.17, JPY: 31.8 },
    CNY: { USD: 0.138, SGD: 0.186, MYR: 0.64, EUR: 0.127, GBP: 0.109, JPY: 20.4 },
    EUR: { USD: 1.087, SGD: 1.47, MYR: 5.06, CNY: 7.88, GBP: 0.86, JPY: 161 },
    GBP: { USD: 1.267, SGD: 1.71, MYR: 5.89, CNY: 9.17, EUR: 1.16, JPY: 187 },
    JPY: { USD: 0.0068, SGD: 0.0091, MYR: 0.0315, CNY: 0.049, EUR: 0.0062, GBP: 0.0053 }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
    return Math.round(amount * rate * 100) / 100;
  };

  const calculateSimplifiedSettlements = (targetCurrency: string) => {
    if (!currentGroup) return [];

    // Get balances by currency and convert all to target currency
    const balancesByCurrency = refreshBalancesByCurrency(currentGroup.id);
    const combinedBalances = new Map<string, number>();

    // Initialize all members with 0 balance
    currentGroup.members.forEach(member => {
      combinedBalances.set(member.userId, 0);
    });

    // Process each currency's balances and convert to target currency
    Object.entries(balancesByCurrency).forEach(([currency, balances]) => {
      balances.forEach(balance => {
        const convertedAmount = convertCurrency(balance.netAmount, currency, targetCurrency);
        const currentBalance = combinedBalances.get(balance.userId) || 0;
        combinedBalances.set(balance.userId, currentBalance + convertedAmount);
      });
    });

    // Create Balance array in target currency
    const convertedBalances = Array.from(combinedBalances.entries()).map(([userId, netAmount]) => {
      const member = currentGroup.members.find(m => m.userId === userId);
      return {
        userId,
        userName: member?.name || 'Unknown',
        netAmount,
        currency: targetCurrency,
        breakdown: []
      };
    }).filter(balance => Math.abs(balance.netAmount) > 0.01);

    // Calculate optimal payments for the combined balances
    return calculateOptimalPayments(convertedBalances);
  };

  useEffect(() => {
    if (currentGroup) {
      calculateSettlements(currentGroup.id);
      
      // Calculate multi-currency settlements
      const balancesByCurrency = refreshBalancesByCurrency(currentGroup.id);
      const paymentsByCurrency: Record<string, any[]> = {};
      
      Object.entries(balancesByCurrency).forEach(([currency, balances]) => {
        paymentsByCurrency[currency] = calculateOptimalPayments(balances);
      });
      
      setOptimalPaymentsByCurrency(paymentsByCurrency);
      
      // Get available currencies from expenses
      const currencies = Array.from(new Set(currentGroup.expenses.map(expense => expense.currency)));
      setAvailableCurrencies(currencies);
      
      // Set default settlement currency to group base currency if available, otherwise first currency
      const defaultCurrency = currencies.includes(currentGroup.baseCurrency) 
        ? currentGroup.baseCurrency 
        : currencies[0] || currentGroup.baseCurrency;
      setSelectedSettlementCurrency(defaultCurrency);
      
      // Reset processing payments when group changes
      setProcessingPayments(new Set());
    }
  }, [currentGroup, calculateSettlements, refreshBalancesByCurrency]);

  // Calculate simplified settlements when currency selection changes
  useEffect(() => {
    if (selectedSettlementCurrency && currentGroup) {
      const simplified = calculateSimplifiedSettlements(selectedSettlementCurrency);
      setSimplifiedSettlements(simplified);
    }
  }, [selectedSettlementCurrency, currentGroup, optimalPaymentsByCurrency]);

  // Show confetti when group becomes fully settled
  useEffect(() => {
    if (isSettled && balances.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isSettled, balances]);

  // Note: No need to reset processed payments since we now check settlements directly from database

  const handleCalculateSettlements = () => {
    if (currentGroup) {
      recalculateAll(currentGroup.id);
      
      // Recalculate multi-currency settlements
      const balancesByCurrency = refreshBalancesByCurrency(currentGroup.id);
      const paymentsByCurrency: Record<string, any[]> = {};
      
      Object.entries(balancesByCurrency).forEach(([currency, balances]) => {
        paymentsByCurrency[currency] = calculateOptimalPayments(balances);
      });
      
      setOptimalPaymentsByCurrency(paymentsByCurrency);
    }
  };

  // Create unique payment identifier
  const createPaymentId = (fromUserId: string, toUserId: string, amount: number, currency: string) => {
    return `${fromUserId}-${toUserId}-${amount.toFixed(2)}-${currency}`;
  };

  // Check if a settlement already exists for this payment
  const isSettlementAlreadyPaid = (fromUserId: string, toUserId: string, amount: number, currency: string): boolean => {
    if (!currentGroup) return false;
    
    // Create a unique identifier for this payment
    const paymentKey = `${fromUserId}-${toUserId}-${Math.round(amount * 100)}-${currency}`;
    
    return currentGroup.settlements.some(settlement => {
      const settlementKey = `${settlement.fromUserId}-${settlement.toUserId}-${Math.round(settlement.amount * 100)}-${settlement.currency}`;
      return settlementKey === paymentKey && settlement.status === SettlementStatus.COMPLETED;
    });
  };

  const handleMarkPaid = async (fromUserId: string, toUserId: string, amount: number, currency: string) => {
    if (!currentGroup) return;
    
    // Check if this exact settlement already exists
    if (isSettlementAlreadyPaid(fromUserId, toUserId, amount, currency)) {
      console.log('Settlement already exists, skipping');
      return;
    }
    
    const paymentId = createPaymentId(fromUserId, toUserId, amount, currency);
    
    // Prevent duplicate clicks
    if (processingPayments.has(paymentId)) {
      console.log('Payment already processing, skipping');
      return;
    }
    
    // Mark as processing
    setProcessingPayments(prev => new Set(prev).add(paymentId));
    
    try {
      const success = await markSettlementPaid(currentGroup.id, fromUserId, toUserId, amount, currency);
      if (success) {
        console.log('Settlement marked successfully, recalculating...');
        // Trigger confetti celebration
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        // Don't call recalculateAll immediately since markSettlementPaid already calls calculateSettlements
        // Just wait for the store to update and then refresh multi-currency calculations
        setTimeout(() => {
          // Recalculate both single currency and multi-currency settlements
          calculateSettlements(currentGroup.id);

          const balancesByCurrency = refreshBalancesByCurrency(currentGroup.id);
          const paymentsByCurrency: Record<string, any[]> = {};

          Object.entries(balancesByCurrency).forEach(([currency, balances]) => {
            paymentsByCurrency[currency] = calculateOptimalPayments(balances);
          });

          setOptimalPaymentsByCurrency(paymentsByCurrency);
        }, 200); // Increased timeout to ensure store update completes
      }
    } catch (error) {
      console.error('Failed to mark payment:', error);
    } finally {
      // Remove from processing after a slight delay to ensure UI updates
      setTimeout(() => {
        setProcessingPayments(prev => {
          const newSet = new Set(prev);
          newSet.delete(paymentId);
          return newSet;
        });
      }, 300);
    }
  };

  const isSettled = isGroupSettled(balances);

  if (!currentGroup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-surface border-2 border-dashed border-border flex items-center justify-center">
            <svg className="w-12 h-12 text-secondary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-headline-2 text-primary mb-2">No Active Group</h2>
          <p className="text-body-medium text-secondary">Create or select a group to view settlement calculations</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ backgroundColor: '#f9fafb', paddingBottom: '24px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '448px', margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              💰 {currentGroup.name}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Last calculated: {new Date().toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleCalculateSettlements}
              disabled={isCalculatingSettlements}
              style={{
                padding: '8px 12px',
                backgroundColor: isCalculatingSettlements ? 'var(--color-text-disabled)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isCalculatingSettlements ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isCalculatingSettlements) (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)';
              }}
              onMouseOut={(e) => {
                if (!isCalculatingSettlements) (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
              }}
            >
              {isCalculatingSettlements ? '⏳ Calculating...' : '🔄 Recalculate'}
            </button>
            
            {availableCurrencies.length > 1 && (
              <button
                onClick={() => setShowSimplified(!showSimplified)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: showSimplified ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.opacity = '1';
                }}
              >
                {showSimplified ? '📋 Multi-Currency' : '🔄 Simplify'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '448px', margin: '0 auto' }}>
        {/* Settlement Status */}
        {isSettled ? (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '32px', 
            textAlign: 'center', 
            border: '2px solid #14b8a6',
            marginBottom: '16px'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto 16px', 
              borderRadius: '50%', 
              backgroundColor: '#14b8a6', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '32px', height: '32px' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#14b8a6', marginBottom: '8px' }}>
              🎉 All Settled!
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Everyone is paid up. No settlements needed.
            </p>
          </div>
        ) : (
          <>
            {/* Balance Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
                💳 Current Balances
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {balances.map((balance) => (
                  <div key={balance.userId} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: balance.userId === currentUser?.id ? '#14b8a6' : '#e5e7eb',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <span style={{ 
                          color: balance.userId === currentUser?.id ? 'white' : '#6b7280',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {balance.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 style={{ 
                          fontSize: '16px', 
                          color: '#1f2937', 
                          fontWeight: '500',
                          marginBottom: '2px'
                        }}>
                          {balance.userName}
                        </h4>
                        {balance.userId === currentUser?.id && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>(You)</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '18px',
                        fontWeight: '600',
                        color: balance.netAmount > 0 ? 'var(--color-success)' : 
                               balance.netAmount < 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                      }}>
                        {balance.netAmount > 0 ? '+' : balance.netAmount < 0 ? '-' : ''}
                        {formatCurrency(Math.abs(balance.netAmount), balance.currency)}
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {balance.netAmount > 0 ? 'is owed' : 
                         balance.netAmount < 0 ? 'owes' : 'all settled'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Selection for Simplified Settlement */}
            {showSimplified && availableCurrencies.length > 1 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>
                    🎯 Simplified Settlement Currency
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    Select which currency to convert all settlements to:
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {availableCurrencies.map(currency => (
                      <button
                        key={currency}
                        onClick={() => setSelectedSettlementCurrency(currency)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: selectedSettlementCurrency === currency ? '#14b8a6' : 'white',
                          color: selectedSettlementCurrency === currency ? 'white' : '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                          if (selectedSettlementCurrency !== currency) {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedSettlementCurrency !== currency) {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                  
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '6px',
                    border: '1px solid #fcd34d'
                  }}>
                    <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                      ⚠️ Exchange rates are approximate. Actual rates may vary at time of payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Simplified Single Currency Settlements */}
            {showSimplified && simplifiedSettlements.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                  🔄 Simplified Settlement in {selectedSettlementCurrency}
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                  {simplifiedSettlements.length} transaction{simplifiedSettlements.length !== 1 ? 's' : ''} to settle everything in {selectedSettlementCurrency}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {simplifiedSettlements.map((payment, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ 
                              padding: '4px 8px',
                              backgroundColor: '#fef3f2',
                              color: '#f97316',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {payment.fromUserName}
                            </span>
                            <span style={{ color: '#6b7280' }}>→</span>
                            <span style={{ 
                              padding: '4px 8px',
                              backgroundColor: '#f0fdfa',
                              color: '#14b8a6',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {payment.toUserName}
                            </span>
                          </div>
                          <p style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                        </div>
                        {(() => {
                          const paymentId = createPaymentId(payment.fromUserId, payment.toUserId, payment.amount, payment.currency);
                          const isProcessing = processingPayments.has(paymentId);
                          const isProcessed = isSettlementAlreadyPaid(payment.fromUserId, payment.toUserId, payment.amount, payment.currency);
                          
                          return (
                            <button
                              onClick={() => handleMarkPaid(payment.fromUserId, payment.toUserId, payment.amount, payment.currency)}
                              disabled={isProcessing || isProcessed}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: isProcessed ? '#10b981' : isProcessing ? '#9ca3af' : '#14b8a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isProcessing || isProcessed ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                minWidth: '100px',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => {
                                if (!isProcessing && !isProcessed) {
                                  (e.target as HTMLButtonElement).style.backgroundColor = '#0d9488';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isProcessing && !isProcessed) {
                                  (e.target as HTMLButtonElement).style.backgroundColor = '#14b8a6';
                                }
                              }}
                            >
                              {isProcessed ? (
                                <>✓ Paid</>
                              ) : isProcessing ? (
                                <>
                                  <span style={{ 
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid #ffffff',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }}></span>
                                  Processing...
                                </>
                              ) : (
                                <>✓ Mark Paid</>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Currency Optimal Payments */}
            {!showSimplified && Object.entries(optimalPaymentsByCurrency).map(([currency, payments]) => (
              payments.length > 0 && (
                <div key={currency} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                    🔄 Settlement for {currency}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                    {payments.length} transaction{payments.length !== 1 ? 's' : ''} to settle {currency} expenses
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {payments.map((payment, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ 
                              padding: '4px 8px',
                              backgroundColor: '#fef3f2',
                              color: '#f97316',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {payment.fromUserName}
                            </span>
                            <span style={{ color: '#6b7280' }}>→</span>
                            <span style={{ 
                              padding: '4px 8px',
                              backgroundColor: '#f0fdfa',
                              color: '#14b8a6',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {payment.toUserName}
                            </span>
                          </div>
                          <p style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                        </div>
                        {(() => {
                          const paymentId = createPaymentId(payment.fromUserId, payment.toUserId, payment.amount, payment.currency);
                          const isProcessing = processingPayments.has(paymentId);
                          const isProcessed = isSettlementAlreadyPaid(payment.fromUserId, payment.toUserId, payment.amount, payment.currency);
                          
                          return (
                            <button
                              onClick={() => handleMarkPaid(payment.fromUserId, payment.toUserId, payment.amount, payment.currency)}
                              disabled={isProcessing || isProcessed}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: isProcessed ? '#10b981' : isProcessing ? '#9ca3af' : '#14b8a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isProcessing || isProcessed ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                minWidth: '100px',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => {
                                if (!isProcessing && !isProcessed) {
                                  (e.target as HTMLButtonElement).style.backgroundColor = '#0d9488';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isProcessing && !isProcessed) {
                                  (e.target as HTMLButtonElement).style.backgroundColor = '#14b8a6';
                                }
                              }}
                            >
                              {isProcessed ? (
                                <>✓ Paid</>
                              ) : isProcessing ? (
                                <>
                                  <span style={{ 
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid #ffffff',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }}></span>
                                  Processing...
                                </>
                              ) : (
                                <>✓ Mark Paid</>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {/* Settlement Summary */}
            {(showSimplified ? simplifiedSettlements.length > 0 : Object.values(optimalPaymentsByCurrency).some(payments => payments.length > 0)) && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>
                  📊 {showSimplified ? 'Simplified' : 'Multi-Currency'} Settlement Summary
                </h3>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>
                  {showSimplified ? (
                    <div>
                      <strong>{selectedSettlementCurrency}:</strong> {simplifiedSettlements.length} transaction{simplifiedSettlements.length !== 1 ? 's' : ''} (converted from multiple currencies)
                    </div>
                  ) : (
                    Object.entries(optimalPaymentsByCurrency).map(([currency, payments]) => (
                      payments.length > 0 && (
                        <div key={currency} style={{ marginBottom: '8px' }}>
                          <strong>{currency}:</strong> {payments.length} transaction{payments.length !== 1 ? 's' : ''}
                        </div>
                      )
                    ))
                  )}
                </div>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: showSimplified ? '#fef3c7' : '#eff6ff', 
                  borderRadius: '6px',
                  border: showSimplified ? '1px solid #fcd34d' : '1px solid #dbeafe'
                }}>
                  <p style={{ fontSize: '14px', color: showSimplified ? '#92400e' : '#1e40af', margin: 0 }}>
                    {showSimplified ? (
                      <>💡 All settlements converted to {selectedSettlementCurrency} using approximate exchange rates. This simplifies payments but may involve currency conversion fees.</>
                    ) : (
                      <>💡 Settlements are organized by currency to avoid unnecessary conversion fees and simplify payments.</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {balances.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            border: '2px dashed #e5e7eb'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto 16px', 
              borderRadius: '8px', 
              backgroundColor: '#f3f4f6',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>No expenses to settle yet</p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Add some expenses to see settlement calculations</p>
          </div>
        )}
      </div>
      </div>

      {/* Confetti celebration for settlements */}
      {showConfetti && <Confetti />}
    </>
  );
};

export default SettlementView;
