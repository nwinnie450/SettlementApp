import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { Group } from '../types';

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { 
    groups, 
    currentGroup, 
    loadGroups, 
    createGroup, 
    deleteGroup, 
    setCurrentGroup 
  } = useGroupStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCurrency, setNewGroupCurrency] = useState('SGD');
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Redirect to create group if no groups exist
  useEffect(() => {
    if (groups.length === 0 && currentUser) {
      navigate('/create-group');
    }
  }, [groups, currentUser, navigate]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newGroupName.trim()) return;

    setIsCreating(true);
    try {
      const group = createGroup(newGroupName.trim(), newGroupCurrency, currentUser.id);
      setCurrentGroup(group.id);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupCurrency('SGD');
      navigate('/'); // Go to dashboard with new group
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (deleteGroup(groupId)) {
      setShowDeleteConfirm(null);
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
      
      // Check if this was the last group
      const remainingGroups = groups.filter(g => g.id !== groupId);
      if (remainingGroups.length === 0) {
        // No groups left, redirect to create group page
        navigate('/create-group');
      }
    }
  };

  const handleSelectGroup = (groupId: string) => {
    setCurrentGroup(groupId);
    navigate('/'); // Go to dashboard with selected group
  };

  const formatMemberCount = (group: Group) => {
    const activeMembers = group.members.filter(m => m.isActive).length;
    return `${activeMembers} member${activeMembers !== 1 ? 's' : ''}`;
  };

  const formatExpenseCount = (group: Group) => {
    const count = group.expenses.length;
    return `${count} expense${count !== 1 ? 's' : ''}`;
  };

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
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '448px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>Your Groups</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '8px 16px',
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
              onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
            >
              + New Group
            </button>
          </div>
        </div>

        <div style={{ padding: '16px', maxWidth: '448px', margin: '0 auto' }}>
          {/* Current Group */}
          {currentGroup && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>
                📌 Current Group
              </h2>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '2px solid #14b8a6',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                      {currentGroup.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        👥 {formatMemberCount(currentGroup)}
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        💰 {formatExpenseCount(currentGroup)}
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {currentGroup.baseCurrency}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#14b8a6', margin: 0 }}>
                      ✓ Active Group
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Groups */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '12px' }}>
              All Groups ({groups.length})
            </h2>
            
            {groups.length === 0 ? (
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
                  borderRadius: '50%', 
                  backgroundColor: '#f3f4f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>No groups yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    color: '#14b8a6',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Create your first group
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {groups.map((group) => {
                  const isCurrentGroup = currentGroup?.id === group.id;
                  const isOwner = group.createdBy === currentUser?.id;
                  
                  return (
                    <div 
                      key={group.id} 
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '16px',
                        border: isCurrentGroup ? '2px solid #14b8a6' : '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => !isCurrentGroup && handleSelectGroup(group.id)}
                      onMouseOver={(e) => {
                        if (!isCurrentGroup) {
                          e.currentTarget.style.borderColor = '#14b8a6';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isCurrentGroup) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                              {group.name}
                            </h3>
                            {isCurrentGroup && (
                              <span style={{ 
                                fontSize: '10px', 
                                padding: '2px 6px', 
                                backgroundColor: '#14b8a6', 
                                color: 'white', 
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                ACTIVE
                              </span>
                            )}
                            {isOwner && (
                              <span style={{ 
                                fontSize: '10px', 
                                padding: '2px 6px', 
                                backgroundColor: '#f59e0b', 
                                color: 'white', 
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                OWNER
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              👥 {formatMemberCount(group)}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              💰 {formatExpenseCount(group)}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              {group.baseCurrency}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            Created {new Date(group.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!isCurrentGroup && (
                            <span style={{ fontSize: '12px', color: '#14b8a6', fontWeight: '500' }}>
                              Tap to select →
                            </span>
                          )}
                          {isOwner && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(group.id);
                              }}
                              style={{
                                padding: '4px',
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#fef2f2';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                              title="Delete group"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
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
          zIndex: 40 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '400px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Create New Group
            </h3>
            
            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Base Currency
                </label>
                <select
                  value={newGroupCurrency}
                  onChange={(e) => setNewGroupCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="MYR">MYR - Malaysian Ringgit</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newGroupName.trim()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: isCreating || !newGroupName.trim() ? '#9ca3af' : '#14b8a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isCreating || !newGroupName.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!isCreating && newGroupName.trim()) {
                      e.target.style.backgroundColor = '#0d9488';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isCreating && newGroupName.trim()) {
                      e.target.style.backgroundColor = '#14b8a6';
                    }
                  }}
                >
                  {isCreating ? (
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
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          zIndex: 40 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '320px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              Delete Group
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this group? This action cannot be undone and all expenses will be lost.
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
                onClick={() => handleDeleteGroup(showDeleteConfirm)}
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
    </>
  );
};

export default Groups;