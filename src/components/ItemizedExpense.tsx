import React, { useState } from 'react';
import { Group } from '../types';

export interface LineItem {
  id: string;
  description: string;
  amount: number;
  selectedMembers: Set<string>;
}

interface ItemizedExpenseProps {
  group: Group;
  onItemsChange: (items: LineItem[]) => void;
  onTotalChange: (total: number) => void;
  currency: string;
}

const ItemizedExpense: React.FC<ItemizedExpenseProps> = ({ group, onItemsChange, onTotalChange, currency }) => {
  const [items, setItems] = useState<LineItem[]>([]);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const addItem = () => {
    if (!newItemDescription.trim() || !newItemAmount || parseFloat(newItemAmount) <= 0) {
      return;
    }

    const newItem: LineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: newItemDescription.trim(),
      amount: parseFloat(newItemAmount),
      selectedMembers: new Set(group.members.filter(m => m.isActive).map(m => m.userId))
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onItemsChange(updatedItems);

    // Update total amount
    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    onTotalChange(newTotal);

    // Reset inputs
    setNewItemDescription('');
    setNewItemAmount('');
  };

  const removeItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    onItemsChange(updatedItems);

    // Update total amount
    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    onTotalChange(newTotal);
  };

  const toggleMemberForItem = (itemId: string, memberId: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const newSelectedMembers = new Set(item.selectedMembers);
        if (newSelectedMembers.has(memberId)) {
          newSelectedMembers.delete(memberId);
        } else {
          newSelectedMembers.add(memberId);
        }
        return { ...item, selectedMembers: newSelectedMembers };
      }
      return item;
    });
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
        Split by Items
      </h3>

      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #dbeafe' }}>
        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
          💡 Add individual items and select who should split each one
        </p>
      </div>

      {/* Add New Item Form */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
              Item Description
            </label>
            <input
              type="text"
              placeholder="e.g., Pizza"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
              Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            style={{
              padding: '10px 16px',
              backgroundColor: '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div>
          <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#14b8a6' }}>
                Total: {getTotalAmount().toFixed(2)} {currency}
              </span>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {items.map((item) => {
              const splitCount = item.selectedMembers.size;
              const perPersonAmount = splitCount > 0 ? item.amount / splitCount : 0;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    marginBottom: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {item.amount.toFixed(2)} {currency} • {splitCount > 0 ? `${perPersonAmount.toFixed(2)} ${currency} each` : 'Select members'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Member Selection */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {group.members.filter(m => m.isActive).map((member) => {
                      const isSelected = item.selectedMembers.has(member.userId);
                      return (
                        <button
                          key={member.userId}
                          type="button"
                          onClick={() => toggleMemberForItem(item.id, member.userId)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #14b8a6' : '1px solid #d1d5db',
                            backgroundColor: isSelected ? '#f0fdfa' : 'white',
                            color: isSelected ? '#14b8a6' : '#6b7280',
                            cursor: 'pointer',
                            fontWeight: isSelected ? '500' : '400'
                          }}
                        >
                          {isSelected && '✓ '}{member.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>No items added yet. Add items above to split this expense.</p>
        </div>
      )}
    </div>
  );
};

export default ItemizedExpense;
