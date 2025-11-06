import React from 'react';
import { Group, Expense, Settlement, GroupInvite, InviteStatus, SettlementStatus } from '../types';

interface ActivityFeedProps {
  group: Group;
  limit?: number;
}

interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement' | 'member_joined' | 'member_left';
  timestamp: string;
  title: string;
  description: string;
  amount?: number;
  currency?: string;
  icon: 'expense' | 'settlement' | 'user' | 'check';
  color: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ group, limit = 10 }) => {
  // Generate activity items from group data
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add expenses
    group.expenses.forEach(expense => {
      const payer = group.members.find(m => m.userId === expense.paidBy);
      activities.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        timestamp: expense.createdAt,
        title: expense.description,
        description: `${payer?.name || 'Someone'} paid ${expense.currency} ${expense.amount.toFixed(2)}`,
        amount: expense.amount,
        currency: expense.currency,
        icon: 'expense',
        color: '#ef4444' // Red
      });
    });

    // Add settlements
    group.settlements
      .filter(s => s.status === SettlementStatus.COMPLETED)
      .forEach(settlement => {
        const fromUser = group.members.find(m => m.userId === settlement.fromUserId);
        const toUser = group.members.find(m => m.userId === settlement.toUserId);
        activities.push({
          id: `settlement-${settlement.id}`,
          type: 'settlement',
          timestamp: settlement.createdAt,
          title: 'Payment Made',
          description: `${fromUser?.name || 'Someone'} paid ${toUser?.name || 'someone'} ${settlement.currency} ${settlement.amount.toFixed(2)}`,
          amount: settlement.amount,
          currency: settlement.currency,
          icon: 'settlement',
          color: '#10b981' // Green
        });
      });

    // Add member joins
    group.members.forEach(member => {
      if (member.joinedAt) {
        activities.push({
          id: `member-${member.userId}`,
          type: 'member_joined',
          timestamp: member.joinedAt,
          title: 'New Member',
          description: `${member.name} joined the group`,
          icon: 'user',
          color: '#14b8a6' // Teal
        });
      }
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  };

  const activities = generateActivities();

  const getIcon = (type: ActivityItem['icon']) => {
    switch (type) {
      case 'expense':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'settlement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-gray-600 text-sm">Start by adding your first expense or inviting members!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
              >
                {getIcon(activity.icon)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                  </div>
                  {activity.amount && (
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: activity.color }}
                      >
                        {activity.currency} {activity.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
