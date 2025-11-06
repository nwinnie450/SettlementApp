import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { useGroupStore } from '../stores/useGroupStore';
import { GroupInviteLink, JoinGroupRequest } from '../types';
import { getGroups } from '../utils/storage';

const JoinGroupScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { joinGroupByInvite, isLoading } = useGroupStore();

  const [inviteInfo, setInviteInfo] = useState<GroupInviteLink | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inviteCode = new URLSearchParams(location.search).get('invite');

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login with invite code
      navigate(`/login?invite=${inviteCode}`, {
        state: { from: location },
        replace: true
      });
      return;
    }

    if (!inviteCode) {
      setError('Invalid invite link. No invite code provided.');
      return;
    }

    // Decode invite information from the invite code
    try {
      const decoded = parseInviteCode(inviteCode);
      setInviteInfo(decoded);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid or expired invite link';

      // If user is already a member, show success message with redirect
      if (errorMessage.includes('already a member')) {
        setSuccess('You are already a member of this group! Redirecting...');

        // Get the group ID for redirect
        const groups = getGroups();
        const group = groups.find(g => g.inviteCode === inviteCode);
        if (group) {
          setTimeout(() => {
            navigate(`/group/${group.id}`);
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/groups');
          }, 2000);
        }
      } else {
        setError(errorMessage);
      }
    }
  }, [isAuthenticated, inviteCode, navigate, location, user]);

  const parseInviteCode = (code: string): GroupInviteLink => {
    try {
      // Look up the actual group from storage using the invite code
      const groups = getGroups();
      const group = groups.find(g => g.inviteCode === code);

      if (!group) {
        throw new Error('Group not found. The invite link may be invalid or the group may have been deleted.');
      }

      // Check if user is already a member
      if (user && group.members.some(m => m.userId === user.id || m.email === user.email)) {
        throw new Error('You are already a member of this group!');
      }

      // Find the inviter (group creator or admin)
      const inviter = group.members.find(m => m.userId === group.createdBy);

      // Calculate expiry date (7 days from now)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      return {
        groupId: group.id,
        groupName: group.name, // Real group name!
        inviteCode: code,
        inviterName: inviter?.name || 'Group Admin', // Real inviter name!
        expiresAt,
        url: window.location.href
      };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Group not found') || error.message.includes('already a member'))) {
        throw error;
      }
      throw new Error('Invalid invite code format');
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteInfo || !user) return;

    setIsJoining(true);
    setError(null);

    try {
      const request: JoinGroupRequest = {
        inviteCode: inviteInfo.inviteCode,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        message: `${user.name} would like to join the group.`
      };

      const response = await joinGroupByInvite(request);

      if (response.success) {
        if (response.requiresApproval) {
          setSuccess(`Join request sent to ${inviteInfo.groupName}! The group admin will review your request and you'll be notified once approved.`);
          // Redirect to groups page after showing success message
          setTimeout(() => {
            navigate('/groups');
          }, 3000);
        } else {
          setSuccess(`Successfully joined ${inviteInfo.groupName}!`);
          setTimeout(() => {
            navigate(`/group/${inviteInfo.groupId}`);
          }, 2000);
        }
      } else {
        setError(response.error || 'Failed to join group. Please try again or contact the group admin.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Unable to join group: ${errorMessage}`);
    } finally {
      setIsJoining(false);
    }
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>Invite Error</h1>
          </div>
        </div>
        <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
            <Button onClick={() => navigate('/groups')} variant="secondary">
              Go to My Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>Success!</h1>
          </div>
        </div>
        <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '32px', height: '32px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>{success}</p>
            <Button onClick={() => navigate('/groups')}>
              Go to My Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!inviteInfo) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>Loading...</h1>
          </div>
        </div>
        <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '32px', height: '32px', color: '#6b7280', animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p style={{ color: '#6b7280' }}>Loading invite information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937' }}>Join Group</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
        {/* Welcome section */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              backgroundColor: '#14b8a6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>You've been invited to join a group</p>
          </div>
        </div>

        {/* Group Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>{inviteInfo.groupName}</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              Invited by {inviteInfo.inviterName}
            </p>

            {/* Group stats */}
            {(() => {
              const groups = getGroups();
              const group = groups.find(g => g.inviteCode === inviteInfo.inviteCode);
              if (group) {
                return (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#14b8a6' }}>{group.members.length}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Members</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#14b8a6' }}>{group.baseCurrency}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Currency</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6b7280' }}>
              <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Invite expires {new Date(inviteInfo.expiresAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Info section */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <svg style={{ width: '20px', height: '20px', color: '#14b8a6', marginRight: '8px', marginTop: '2px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div style={{ fontSize: '14px' }}>
              <p style={{ color: '#1f2937', fontWeight: '500', marginBottom: '4px' }}>What happens next?</p>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Your join request will be sent to the group admin for approval.
                You'll be notified once they review your request.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              onClick={handleJoinGroup}
              fullWidth
              loading={isJoining}
              disabled={isJoining}
            >
              {isJoining ? 'Sending Request...' : 'Request to Join Group'}
            </Button>

            <Button
              onClick={() => navigate('/groups')}
              variant="secondary"
              fullWidth
            >
              Maybe Later
            </Button>
          </div>
        </div>

        {/* User info */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Signed in as {user?.name} ({user?.email})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupScreen;