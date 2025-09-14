import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { useGroupStore } from '../stores/useGroupStore';
import { GroupInviteLink, JoinGroupRequest } from '../types';

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
      setError('Invalid invite link');
      return;
    }

    // Decode invite information from the invite code
    try {
      // In a real app, you'd fetch this from your backend
      // For now, we'll decode basic info from the invite code
      const decoded = parseInviteCode(inviteCode);
      setInviteInfo(decoded);
    } catch (err) {
      setError('Invalid or expired invite link');
    }
  }, [isAuthenticated, inviteCode, navigate, location]);

  const parseInviteCode = (code: string): GroupInviteLink => {
    // In a real implementation, this would validate against your backend
    // For demo purposes, we'll parse a basic format
    try {
      const parts = code.split('_');
      if (parts.length < 3) throw new Error('Invalid format');

      const [, groupId, timestamp] = parts;
      const expiresAt = new Date(parseInt(timestamp) + 7 * 24 * 60 * 60 * 1000).toISOString();

      return {
        groupId,
        groupName: `Group ${groupId.slice(-6)}`, // Placeholder name
        inviteCode: code,
        inviterName: 'Group Admin', // Placeholder
        expiresAt,
        url: window.location.href
      };
    } catch {
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
          setSuccess('Join request sent! The group admin will review your request.');
        } else {
          setSuccess('Successfully joined the group!');
          setTimeout(() => {
            navigate(`/group/${inviteInfo.groupId}`);
          }, 2000);
        }
      } else {
        setError(response.error || 'Failed to join group');
      }
    } catch (err) {
      setError('An error occurred while joining the group');
    } finally {
      setIsJoining(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Invite Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/groups')} variant="secondary">
            Go to My Groups
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Success!</h1>
          <p className="text-gray-600 mb-6">{success}</p>
          <Button onClick={() => navigate('/groups')}>
            Go to My Groups
          </Button>
        </div>
      </div>
    );
  }

  if (!inviteInfo) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-spin">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">Loading invite information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-light text-gray-900 mb-2">Join Group</h1>
        <p className="text-gray-600">You've been invited to join a group</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">{inviteInfo.groupName}</h2>
          <p className="text-sm text-gray-600 mb-4">
            Invited by {inviteInfo.inviterName}
          </p>

          <div className="flex items-center justify-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expires {new Date(inviteInfo.expiresAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">What happens next?</p>
            <p className="text-blue-700">
              Your join request will be sent to the group admin for approval.
              You'll be notified once they review your request.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
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

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Signed in as {user?.name} ({user?.email})
        </p>
      </div>
    </div>
  );
};

export default JoinGroupScreen;