import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageMembers from '../components/forms/ManageMembers';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { Expense, ExpenseSplit } from '../types';

type SplitType = 'equal' | 'custom' | 'percentage';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { currentGroup, addExpense, updateMemberName, removeMember } = useGroupStore();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: currentGroup?.baseCurrency || 'SGD',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    paidBy: currentUser?.id || '',
    photo: null as string | null
  });
  
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [percentageSplits, setPercentageSplits] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const categories = [
    { value: 'food', label: '🍕 Food & Dining' },
    { value: 'transport', label: '🚗 Transportation' },
    { value: 'accommodation', label: '🏨 Accommodation' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'shopping', label: '🛍️ Shopping' },
    { value: 'utilities', label: '⚡ Utilities' },
    { value: 'general', label: '📝 General' }
  ];

  useEffect(() => {
    if (!currentGroup || !currentUser) {
      navigate('/dashboard');
      return;
    }
    
    // Initialize with all active members selected by default
    const activeMemberIds = new Set(currentGroup.members.filter(m => m.isActive).map(m => m.userId));
    setSelectedMembers(activeMemberIds);
  }, [currentGroup, currentUser, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (selectedMembers.size === 0) {
      newErrors.members = 'Select at least one member';
    }
    
    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid for this expense';
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
    
    // Validate percentage splits
    if (splitType === 'percentage') {
      const totalPercentage = Array.from(selectedMembers).reduce((sum, memberId) => {
        return sum + (parseFloat(percentageSplits[memberId]) || 0);
      }, 0);
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        newErrors.splits = 'Percentages must equal 100%';
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
      
      switch (splitType) {
        case 'equal':
          splitAmount = amount / memberCount;
          break;
        case 'custom':
          splitAmount = parseFloat(customSplits[memberId]) || 0;
          break;
        case 'percentage':
          const percentage = parseFloat(percentageSplits[memberId]) || 0;
          splitAmount = (amount * percentage) / 100;
          break;
        default:
          splitAmount = 0;
      }
      
      return {
        userId: memberId,
        amount: splitAmount,
        percentage: splitType === 'percentage' ? parseFloat(percentageSplits[memberId]) || 0 : (splitAmount / amount) * 100
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!currentGroup || !currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      const expense: Expense = {
        id: Date.now().toString(),
        groupId: currentGroup.id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        baseCurrencyAmount: parseFloat(formData.amount), // TODO: Convert with exchange rate
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        paidBy: formData.paidBy,
        photo: formData.photo || undefined,
        splits: calculateSplits(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addExpense(expense);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Failed to add expense. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
      // Remove from custom splits
      const newCustomSplits = { ...customSplits };
      const newPercentageSplits = { ...percentageSplits };
      delete newCustomSplits[memberId];
      delete newPercentageSplits[memberId];
      setCustomSplits(newCustomSplits);
      setPercentageSplits(newPercentageSplits);
    } else {
      newSelected.add(memberId);
      // Initialize splits for new member
      if (splitType === 'custom') {
        const amount = parseFloat(formData.amount) || 0;
        const equalShare = amount / (newSelected.size);
        setCustomSplits(prev => ({ ...prev, [memberId]: equalShare.toFixed(2) }));
      } else if (splitType === 'percentage') {
        const equalPercentage = 100 / newSelected.size;
        setPercentageSplits(prev => ({ ...prev, [memberId]: equalPercentage.toFixed(1) }));
      }
    }
    setSelectedMembers(newSelected);
  };

  const handleEditMember = (memberId: string, currentName: string) => {
    setEditingMember(memberId);
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingMember || !currentGroup) return;

    // Check if new name already exists
    const nameExists = currentGroup.members.some(
      member => member.userId !== editingMember && 
      member.name.toLowerCase() === editName.trim().toLowerCase()
    );
    
    if (nameExists) {
      setErrors({ ...errors, editName: 'A member with this name already exists' });
      return;
    }

    const success = updateMemberName(currentGroup.id, editingMember, editName);
    if (success) {
      setEditingMember(null);
      setEditName('');
      setErrors({ ...errors, editName: '' });
    } else {
      setErrors({ ...errors, editName: 'Failed to update member name' });
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditName('');
    setErrors({ ...errors, editName: '' });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!currentGroup) return;
    
    if (memberId === currentGroup.createdBy) {
      setErrors({ ...errors, removeMember: 'Cannot remove group creator' });
      return;
    }

    const success = removeMember(currentGroup.id, memberId);
    if (success) {
      // Remove from selected members if they were selected
      const newSelected = new Set(selectedMembers);
      newSelected.delete(memberId);
      setSelectedMembers(newSelected);
      
      // Clear from custom splits
      const newCustomSplits = { ...customSplits };
      const newPercentageSplits = { ...percentageSplits };
      delete newCustomSplits[memberId];
      delete newPercentageSplits[memberId];
      setCustomSplits(newCustomSplits);
      setPercentageSplits(newPercentageSplits);

      // Update paidBy if the removed member was selected
      if (formData.paidBy === memberId) {
        setFormData({ ...formData, paidBy: currentUser?.id || '' });
      }
      
      setErrors({ ...errors, removeMember: '' });
    } else {
      setErrors({ ...errors, removeMember: 'Failed to remove member' });
    }
  };

  if (!currentGroup || !currentUser) {
    return null;
  }

  const amount = parseFloat(formData.amount) || 0;
  const memberCount = selectedMembers.size;
  const equalShare = memberCount > 0 ? amount / memberCount : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px',
              marginLeft: '-8px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginLeft: '8px' }}>Add expense</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ paddingBottom: '120px' }}>
        <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
          {/* Basic Details */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>Expense details</h3>
            
            {/* Photo attachment */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                📸 Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setFormData({ ...formData, photo: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              {formData.photo && (
                <div style={{ marginTop: '8px' }}>
                  <img 
                    src={formData.photo} 
                    alt="Expense receipt" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: null })}
                    style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Description {errors.description && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <input
                type="text"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: errors.description ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                onBlur={(e) => e.target.style.borderColor = errors.description ? '#ef4444' : '#d1d5db'}
              />
              {errors.description && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.description}</p>
              )}
            </div>
            
            {/* Category selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Category</label>
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
                  backgroundColor: 'white',
                  color: '#1f2937'
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Amount {errors.amount && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: errors.amount ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                  onBlur={(e) => e.target.style.borderColor = errors.amount ? '#ef4444' : '#d1d5db'}
                />
                {errors.amount && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.amount}</p>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Currency</label>
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
                    backgroundColor: 'white',
                    color: '#1f2937'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
          </div>

          {/* Who paid */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Who paid? {errors.paidBy && <span style={{ color: '#ef4444' }}>*</span>}
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
                    style={{
                      marginRight: '12px',
                      accentColor: '#14b8a6',
                      cursor: 'pointer'
                    }}
                  />
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
                  <span style={{ 
                    fontSize: '16px', 
                    color: '#1f2937',
                    fontWeight: formData.paidBy === member.userId ? '500' : '400'
                  }}>
                    {member.name} 
                    {member.userId === currentUser.id && (
                      <span style={{ color: '#6b7280', marginLeft: '4px' }}>(you)</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Split between */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>Split between</h3>
              <button
                type="button"
                onClick={() => setShowManageMembers(true)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#14b8a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0d9488'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#14b8a6'}
              >
                👥 Manage Members
              </button>
            </div>
            
            {errors.members && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{errors.members}</p>
            )}
            
            {errors.removeMember && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{errors.removeMember}</p>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentGroup.members.filter(member => member.isActive).map(member => (
                <div key={member.userId} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa'
                }}>
                  <input
                    type="checkbox"
                    id={`member-${member.userId}`}
                    checked={selectedMembers.has(member.userId)}
                    onChange={() => toggleMemberSelection(member.userId)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#14b8a6',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {editingMember === member.userId ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginLeft: '12px', gap: '8px' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#14b8a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <label 
                        htmlFor={`member-${member.userId}`} 
                        style={{ 
                          flex: 1,
                          marginLeft: '12px', 
                          color: '#1f2937', 
                          fontSize: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        {member.name} 
                        {member.userId === currentUser.id && (
                          <span style={{ color: '#6b7280' }}> (you)</span>
                        )}
                        {member.userId === currentGroup.createdBy && (
                          <span style={{ color: '#14b8a6', fontSize: '12px' }}> (creator)</span>
                        )}
                      </label>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEditMember(member.userId, member.name)}
                          style={{
                            padding: '4px 6px',
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                          title="Edit name"
                        >
                          ✏️
                        </button>
                        
                        {member.userId !== currentGroup.createdBy && (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            style={{
                              padding: '4px 6px',
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                            title="Remove member"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {errors.editName && (
                <p style={{ color: '#ef4444', fontSize: '12px' }}>{errors.editName}</p>
              )}
            </div>
          </div>

          {/* Split details */}
          {selectedMembers.size > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>Split equally</h3>
              
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Each person owes</p>
                <p style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>
                  {(amount / memberCount || 0).toFixed(2)} {formData.currency}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginBottom: '16px' }}>
              <p style={{ color: '#dc2626', fontSize: '14px' }}>{errors.submit}</p>
            </div>
          )}

          {/* Alternative Submit Button - Inside Form */}
          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedMembers.size === 0 || !formData.description.trim() || !formData.amount || !formData.paidBy}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: (isSubmitting || selectedMembers.size === 0 || !formData.description.trim() || !formData.amount || !formData.paidBy) ? '#9ca3af' : '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (isSubmitting || selectedMembers.size === 0 || !formData.description.trim() || !formData.amount || !formData.paidBy) ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {isSubmitting ? 'Saving Expense...' : 'Save Expense'}
            </button>
            
            {/* Status indicator */}
            <div style={{ 
              textAlign: 'center', 
              fontSize: '14px', 
              color: '#6b7280',
              marginTop: '8px'
            }}>
              {!formData.description.trim() && <p>❌ Missing: Description</p>}
              {!formData.amount && <p>❌ Missing: Amount</p>}
              {!formData.paidBy && <p>❌ Missing: Who paid</p>}
              {selectedMembers.size === 0 && <p>❌ Missing: Select members to split with</p>}
              {formData.description.trim() && formData.amount && formData.paidBy && selectedMembers.size > 0 && (
                <p style={{ color: '#14b8a6' }}>✅ Ready to save!</p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Manage Members Modal */}
      <ManageMembers
        isOpen={showManageMembers}
        onClose={() => {
          setShowManageMembers(false);
          // Refresh selected members to include any newly added ones
          if (currentGroup) {
            const activeMemberIds = new Set(currentGroup.members.filter(m => m.isActive).map(m => m.userId));
            // Keep existing selections that are still valid
            const validSelections = new Set([...selectedMembers].filter(id => activeMemberIds.has(id)));
            setSelectedMembers(validSelections);
          }
        }}
      />

      {/* Fixed bottom button */}
      <div style={{ 
        position: 'fixed', 
        bottom: '0', 
        left: '0', 
        right: '0', 
        backgroundColor: 'white', 
        borderTop: '2px solid #e5e7eb', 
        padding: '20px 16px',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          {/* Debug info - remove this after testing */}
          <div style={{ 
            marginBottom: '8px', 
            fontSize: '12px', 
            color: '#6b7280',
            textAlign: 'center'
          }}>
            Debug: Description: {formData.description ? '✓' : '✗'}, 
            Amount: {formData.amount ? '✓' : '✗'}, 
            PaidBy: {formData.paidBy ? '✓' : '✗'}, 
            Members: {selectedMembers.size}
          </div>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedMembers.size === 0 || !formData.description.trim() || !formData.amount || !formData.paidBy}
            style={{
              width: '100%',
              padding: '18px',
              backgroundColor: (isSubmitting || selectedMembers.size === 0 || !formData.description.trim() || !formData.amount || !formData.paidBy) ? '#9ca3af' : '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: (isSubmitting || selectedMembers.size === 0 || !formData.description.trim() || !formData.amount || !formData.paidBy) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting && selectedMembers.size > 0 && formData.description.trim() && formData.amount && formData.paidBy) {
                e.currentTarget.style.backgroundColor = '#0d9488';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting && selectedMembers.size > 0 && formData.description.trim() && formData.amount && formData.paidBy) {
                e.currentTarget.style.backgroundColor = '#14b8a6';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isSubmitting ? '💾 SAVING...' : '💾 SAVE EXPENSE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;