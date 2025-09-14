import React, { useState } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { useGroupStore } from '../stores/useGroupStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Group, GroupInvite, GroupInviteLink, GroupRole } from '../types';

interface GroupInviteManagerProps {
  group: Group;
  onClose: () => void;
}

const GroupInviteManager: React.FC<GroupInviteManagerProps> = ({ group, onClose }) => {
  const { user } = useAuthStore();
  const { generateInviteLink, getPendingInvites, approveInvite, declineInvite } = useGroupStore();

  const [activeTab, setActiveTab] = useState<'link' | 'requests'>('link');
  const [inviteLink, setInviteLink] = useState<GroupInviteLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Check if user is admin
  const isAdmin = user && (
    group.adminIds.includes(user.id) ||
    group.createdBy === user.id ||
    group.members.find(m => m.userId === user.id)?.role === GroupRole.ADMIN
  );

  if (!isAdmin) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Access Denied">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Only group admins can manage invitations.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  const handleGenerateLink = () => {
    if (!user) return;

    const link = generateInviteLink(group.id, user.id);
    if (link) {
      setInviteLink(link);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApproveInvite = async (inviteId: string) => {
    setLoading(prev => ({ ...prev, [inviteId]: true }));
    await approveInvite(group.id, inviteId);
    setLoading(prev => ({ ...prev, [inviteId]: false }));
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setLoading(prev => ({ ...prev, [inviteId]: true }));
    await declineInvite(group.id, inviteId);
    setLoading(prev => ({ ...prev, [inviteId]: false }));
  };

  const pendingInvites = getPendingInvites(group.id);

  return (
    <Modal isOpen={true} onClose={onClose} title="Manage Group Invitations" size="large">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'link'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Invite Link
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Join Requests
            {pendingInvites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </div>

        {/* Invite Link Tab */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">How invite links work</p>
                  <p className="text-blue-700">
                    Share this link with people you want to invite. When they click it, they'll be asked to create an account or sign in, then request to join the group. You'll need to approve their request.
                  </p>
                </div>
              </div>
            </div>

            {!inviteLink ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Invite Link</h3>
                <p className="text-gray-600 mb-4">Create a shareable link to invite new members to your group.</p>
                <Button onClick={handleGenerateLink}>Generate Link</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inviteLink.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="secondary"
                      size="small"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Expires on {new Date(inviteLink.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Join ${group.name} on GroupSettle`,
                          text: `You've been invited to join ${group.name} for expense sharing!`,
                          url: inviteLink.url
                        });
                      } else {
                        handleCopyLink();
                      }
                    }}
                    variant="secondary"
                    fullWidth
                  >
                    Share Link
                  </Button>
                  <Button
                    onClick={() => setInviteLink(null)}
                    variant="text"
                    fullWidth
                  >
                    Generate New Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Join Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingInvites.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">When people request to join your group, they'll appear here for approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Pending Join Requests ({pendingInvites.length})
                </h3>
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-teal-600">
                              {invite.inviteeEmail?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {invite.inviteeEmail}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested {new Date(invite.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {invite.message && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                            <p className="text-xs text-gray-600">{invite.message}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => handleApproveInvite(invite.id)}
                          size="small"
                          loading={loading[invite.id]}
                          disabled={loading[invite.id]}
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeclineInvite(invite.id)}
                          variant="secondary"
                          size="small"
                          loading={loading[invite.id]}
                          disabled={loading[invite.id]}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupInviteManager;