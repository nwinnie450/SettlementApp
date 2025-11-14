import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { Expense, ExpenseSplit } from '../types';
import { EXPENSE_CATEGORIES, getCategoryConfig } from '../utils/categories';
import { fetchExchangeRates, convertCurrency, type ExchangeRates } from '../services/exchangeRateService';
import { notifyNewExpense, areNotificationsEnabled } from '../services/browserNotifications';

interface QuickAddExpenseProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickAddExpense: React.FC<QuickAddExpenseProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { currentGroup, addExpense } = useGroupStore();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(currentUser?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      setPaidBy(currentUser.id);
    }
  }, [currentUser]);

  // Fetch exchange rates when modal opens
  useEffect(() => {
    if (isOpen && currentGroup) {
      fetchExchangeRates(currentGroup.baseCurrency)
        .then(rates => setExchangeRates(rates))
        .catch(err => console.error('Failed to load exchange rates:', err));
    }
  }, [isOpen, currentGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentGroup || !currentUser) return;

    // Validation
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create equal split among all active members
      const activeMembers = currentGroup.members.filter(m => m.isActive);
      const splitAmount = amountNum / activeMembers.length;

      const splits: ExpenseSplit[] = activeMembers.map(member => ({
        userId: member.userId,
        amount: splitAmount,
        percentage: 100 / activeMembers.length
      }));

      // In quick add, we always use base currency for simplicity
      const newExpense: Expense = {
        id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        groupId: currentGroup.id,
        description: description.trim(),
        amount: amountNum,
        currency: currentGroup.baseCurrency,
        baseCurrencyAmount: amountNum,
        category: category,
        paidBy: paidBy,
        splits: splits,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const success = await addExpense(newExpense);

      if (success) {
        // Send browser notification if enabled
        if (areNotificationsEnabled()) {
          const paidByMember = currentGroup.members.find(m => m.userId === paidBy);
          notifyNewExpense(
            currentGroup.name,
            description.trim(),
            `${amountNum.toFixed(2)} ${currentGroup.baseCurrency}`,
            paidByMember?.name || 'Someone'
          );
        }

        // Reset form
        setDescription('');
        setAmount('');
        setCategory('food');
        onClose();
      } else {
        setError('Failed to add expense. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanced = () => {
    onClose();
    navigate('/add-expense');
  };

  if (!currentGroup) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Expense" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <Input
          type="text"
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Amount */}
        <Input
          type="number"
          label={`Amount (${currentGroup.baseCurrency})`}
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          required
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EXPENSE_CATEGORIES.slice(0, 9).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  category === cat.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundColor: category === cat.id ? cat.bgColor : 'white'
                }}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-xs text-gray-700 text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Who Paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who paid?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {currentGroup.members.filter(m => m.isActive).map((member) => (
              <button
                key={member.userId}
                type="button"
                onClick={() => setPaidBy(member.userId)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  paidBy === member.userId
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {member.name}
                {member.userId === currentUser?.id && ' (You)'}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            ✓ Split equally among all {currentGroup.members.filter(m => m.isActive).length} members
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Add Expense
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleAdvanced}
          >
            Advanced
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickAddExpense;
