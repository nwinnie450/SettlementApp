import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useGroupStore } from '../../stores/useGroupStore';
import { useAppStore } from '../../stores/useAppStore';

interface ManageMembersProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageMembers: React.FC<ManageMembersProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAppStore();
  const { currentGroup, addMember, removeMember, updateMemberName } = useGroupStore();
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!currentGroup || !currentUser) {
    return null;
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName.trim()) {
      setError('Member name is required');
      return;
    }

    // Check if name already exists
    const nameExists = currentGroup.members.some(
      member => member.name.toLowerCase() === newMemberName.trim().toLowerCase()
    );
    
    if (nameExists) {
      setError('A member with this name already exists');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const success = addMember(currentGroup.id, newMemberName);
      if (success) {
        setNewMemberName('');
      } else {
        setError('Failed to add member');
      }
    } catch (err) {
      setError('Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (userId === currentGroup.createdBy) {
      setError('Cannot remove group creator');
      return;
    }

    const success = removeMember(currentGroup.id, userId);
    if (!success) {
      setError('Failed to remove member');
    }
  };

  const handleEditName = (userId: string, currentName: string) => {
    setEditingMember(userId);
    setEditName(currentName);
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingMember) return;

    // Check if new name already exists (excluding current member)
    const nameExists = currentGroup.members.some(
      member => member.userId !== editingMember && 
      member.name.toLowerCase() === editName.trim().toLowerCase()
    );
    
    if (nameExists) {
      setError('A member with this name already exists');
      return;
    }

    const success = updateMemberName(currentGroup.id, editingMember, editName);
    if (success) {
      setEditingMember(null);
      setEditName('');
    } else {
      setError('Failed to update member name');
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditName('');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members" size="medium">
      <div style={{ padding: '20px' }}>
        {/* Add new member */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
            Add New Member
          </h3>
          
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                placeholder="Enter member name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                label="Name"
                error={error && !newMemberName.trim() ? error : undefined}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!newMemberName.trim() || isSubmitting}
            >
              Add
            </Button>
          </form>
        </div>

        {/* Current members */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
            Current Members ({currentGroup.members.filter(m => m.isActive).length})
          </h3>
          
          {error && !newMemberName.trim() && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '6px', 
              marginBottom: '16px' 
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentGroup.members.filter(member => member.isActive).map(member => (
              <div 
                key={member.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                {editingMember === member.userId ? (
                  <>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Member name"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#14b8a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                        {member.name}
                        {member.userId === currentUser.id && (
                          <span style={{ color: '#6b7280', fontWeight: '400', marginLeft: '8px' }}>
                            (you)
                          </span>
                        )}
                        {member.userId === currentGroup.createdBy && (
                          <span style={{ 
                            color: '#14b8a6', 
                            fontWeight: '400', 
                            marginLeft: '8px',
                            fontSize: '14px'
                          }}>
                            (creator)
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditName(member.userId, member.name)}
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.color = '#1f2937';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#6b7280';
                        }}
                        title="Edit name"
                      >
                        ✏️
                      </button>
                      
                      {member.userId !== currentGroup.createdBy && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          style={{
                            padding: '8px',
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
          </div>
        </div>

        {/* Inactive members (if any) */}
        {currentGroup.members.some(m => !m.isActive) && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280', marginBottom: '16px' }}>
              Inactive Members
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentGroup.members.filter(member => !member.isActive).map(member => (
                <div 
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      {member.name} (removed but has expense history)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageMembers;