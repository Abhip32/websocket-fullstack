import React from 'react';
import { Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ChatHeader = ({ conversation, onlineUsers, currentUsername }) => {
  if (!conversation) {
    return (
      <div className="p-4 border-b border-gray-200 bg-white">
        <p className="text-gray-500">Select a conversation</p>
      </div>
    );
  }

  const getDisplayName = () => {
    if (conversation.conversationType === 'group') {
      return conversation.name;
    }
    return conversation.participants?.[0]?.username || 'Unknown';
  };

  const getStatusInfo = () => {
    if (conversation.conversationType === 'group') {
      return `${conversation.participants?.length || 0} members`;
    }

    const participant =
      conversation.participants?.find((p) => p.username !== currentUsername) ||
      conversation.participants?.[0];

    if (!participant) return 'Unknown';

    // Check both the real-time Map and the participant's stored isOnline status
    const isInMap = onlineUsers.has(participant._id);
    const isInDatabase = participant.isOnline === true;

    if (isInMap || isInDatabase) {
      return 'Active now';
    }

    const lastSeen = participant.lastSeen || participant.updatedAt || participant.createdAt;
    if (!lastSeen) {
      return 'Last seen unknown';
    }

    const lastSeenDate = new Date(lastSeen);
    if (Number.isNaN(lastSeenDate.getTime())) {
      return 'Last seen unknown';
    }

    return `Last seen ${formatDistanceToNow(lastSeenDate, {
      addSuffix: true,
    })}`;
  };

  const isOnline = () => {
    if (conversation.conversationType === 'group') return false;
    const participant = conversation.participants?.[0];
    if (!participant) return false;
    
    // Check both the real-time Map and the participant's stored isOnline status
    const isInMap = onlineUsers.has(participant._id);
    const isInDatabase = participant.isOnline === true;
    
    return isInMap || isInDatabase;
  };

  return (
    <div className="p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {getDisplayName()?.charAt(0).toUpperCase()}
          </div>
          {isOnline() && (
            <Circle size={12} className="absolute bottom-0 right-0 bg-green-500 text-green-500 rounded-full" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-purple-900">{getDisplayName()}</h2>
          <p className="text-xs text-purple-600">{getStatusInfo()}</p>
        </div>
      </div>
    </div>
  );
};
