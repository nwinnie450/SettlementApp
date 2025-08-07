import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useGroupStore } from '../../stores/useGroupStore';
import { useAppStore } from '../../stores/useAppStore';
import { Expense, ExpenseSplit } from '../../types';

interface EditExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

const EditExpense: React.FC<EditExpenseProps> = ({ isOpen, onClose, expense }) => {
  const { currentUser } = useAppStore();
  const { currentGroup, updateExpense } = useGroupStore();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'SGD',
    category: 'general',
    date: '',
    paidBy: ''
  });

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        currency: expense.currency,
        category: expense.category,
        date: expense.date.split('T')[0],
        paidBy: expense.paidBy
      });

      // Set selected members from splits
      const memberIds = new Set(expense.splits.map(split => split.userId));
      setSelectedMembers(memberIds);

      // Initialize custom splits
      const customSplitData: Record<string, string> = {};
      expense.splits.forEach(split => {
        customSplitData[split.userId] = split.amount.toString();
      });
      setCustomSplits(customSplitData);

      // Determine split type
      const amount = expense.amount;
      const memberCount = expense.splits.length;
      const equalAmount = amount / memberCount;
      const isEqual = expense.splits.every(split => Math.abs(split.amount - equalAmount) < 0.01);
      setSplitType(isEqual ? 'equal' : 'custom');
    }
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (selectedMembers.size === 0) {
      newErrors.members = 'Select at least one member';
    }

    // Validate custom splits
    if (splitType === 'custom') {
      const totalCustom = Array.from(selectedMembers).reduce((sum, memberId) => {
        return sum + (parseFloat(customSplits[memberId]) || 0);
      }, 0);
      
      if (Math.abs(totalCustom - amount) > 0.01) {
        newErrors.splits = `Custom splits must equal total amount (${amount})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSplits = (): ExpenseSplit[] => {
    const amount = parseFloat(formData.amount);
    const memberCount = selectedMembers.size;
    
    return Array.from(selectedMembers).map(memberId => {
      let splitAmount: number;
      
      if (splitType === 'equal') {
        splitAmount = amount / memberCount;
      } else {
        splitAmount = parseFloat(customSplits[memberId]) || 0;
      }
      
      return {
        userId: memberId,
        amount: splitAmount,
        percentage: (splitAmount / amount) * 100
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !expense) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedExpense: Partial<Expense> = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        baseCurrencyAmount: parseFloat(formData.amount), // TODO: Convert with exchange rate
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        paidBy: formData.paidBy,
        splits: calculateSplits(),
        updatedAt: new Date().toISOString()
      };
      
      const success = await updateExpense(expense.id, updatedExpense);
      if (success) {
        onClose();
        // Reset form
        setFormData({
          description: '',
          amount: '',
          currency: 'SGD',
          category: 'general',
          date: '',
          paidBy: ''
        });
        setSelectedMembers(new Set());
        setCustomSplits({});
        setErrors({});
      } else {
        setErrors({ submit: 'Failed to update expense. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update expense. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
      const newCustomSplits = { ...customSplits };
      delete newCustomSplits[memberId];
      setCustomSplits(newCustomSplits);
    } else {
      newSelected.add(memberId);
      if (splitType === 'custom') {
        const amount = parseFloat(formData.amount) || 0;
        const equalShare = amount / (newSelected.size);
        setCustomSplits(prev => ({ ...prev, [memberId]: equalShare.toFixed(2) }));
      }
    }
    setSelectedMembers(newSelected);
  };

  if (!currentGroup || !currentUser || !expense) {
    return null;
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
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense" size="large">
        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Expense Details
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                label="Description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={errors.description}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <Input
                type="number"
                label="Amount"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={errors.amount}
                required
              />
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="SGD">SGD</option>
                  <option value="MYR">MYR</option>
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Who Paid */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Who Paid?
            </h3>
            {errors.paidBy && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{errors.paidBy}</p>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentGroup.members.filter(member => member.isActive).map(member => (
                <label 
                  key={member.userId}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '12px',
                    border: formData.paidBy === member.userId ? '2px solid #14b8a6' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.paidBy === member.userId ? '#f0fdfa' : 'white'
                  }}
                  onClick={() => setFormData({ ...formData, paidBy: member.userId })}
                >
                  <input
                    type="radio"
                    name="paidBy"
                    value={member.userId}
                    checked={formData.paidBy === member.userId}
                    onChange={() => setFormData({ ...formData, paidBy: member.userId })}
                    style={{ marginRight: '12px' }}
                  />
                  <span>{member.name} {member.userId === currentUser.id && '(you)'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Split Between */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Split Between
            </h3>
            {errors.members && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{errors.members}</p>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSplitType('equal')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: splitType === 'equal' ? '#14b8a6' : 'white',
                    color: splitType === 'equal' ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: splitType === 'custom' ? '#14b8a6' : 'white',
                    color: splitType === 'custom' ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Custom Split
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentGroup.members.filter(member => member.isActive).map(member => (
                  <div key={member.userId} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.userId)}
                      onChange={() => toggleMemberSelection(member.userId)}
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ flex: 1 }}>
                      {member.name} {member.userId === currentUser.id && '(you)'}
                    </span>
                    
                    {splitType === 'custom' && selectedMembers.has(member.userId) && (
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={customSplits[member.userId] || ''}
                        onChange={(e) => setCustomSplits(prev => ({ 
                          ...prev, 
                          [member.userId]: e.target.value 
                        }))}
                        style={{
                          width: '80px',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    )}

                    {splitType === 'equal' && selectedMembers.has(member.userId) && (
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {((parseFloat(formData.amount) || 0) / selectedMembers.size || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {errors.splits && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{errors.splits}</p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div style={{ 
              padding: '16px', 
              borderRadius: '8px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              marginBottom: '16px' 
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px' }}>{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            padding: '16px 0',
            borderTop: '1px solid #e5e7eb',
            marginTop: '24px',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '100px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) e.target.style.backgroundColor = '#0d9488';
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) e.target.style.backgroundColor = '#14b8a6';
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Updating...
                </>
              ) : (
                <>
                  💾 Update Expense
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </Modal>
    </>
  );
};

export default EditExpense;