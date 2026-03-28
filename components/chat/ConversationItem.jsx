import React from 'react';
import { Circle } from 'lucide-react';

export const ConversationItem = ({
  conversation,
  isSelected,
  onlineUsers,
  onClick,
  currentUser,
}) => {
  const getDisplayName = () => {
    if (conversation.conversationType === 'group') {
      return conversation.name;
    }

    const participants = conversation.participants || [];
    if (participants.length === 0) return 'Unknown';

    if (currentUser?.userId) {
      const other = participants.find((p) => p._id?.toString() !== currentUser.userId.toString());
      if (other) return other.username || 'Unknown';
    }

    return participants[0]?.username || 'Unknown';
  };

  const isOnline = () => {
    if (conversation.conversationType === 'group') return false;

    const participants = conversation.participants || [];
    if (participants.length === 0) return false;

    const participant = currentUser?.userId
      ? participants.find((p) => p._id?.toString() !== currentUser.userId.toString())
      : participants[0];

    if (!participant) return false;

    // Check both the real-time Map and the participant's stored isOnline status
    const isInMap = onlineUsers.has(participant._id);
    const isInDatabase = participant.isOnline === true;

    return isInMap || isInDatabase;
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer border-b border-purple-100 hover:bg-purple-100/50 transition ${
        isSelected ? 'bg-purple-100 border-l-4 border-l-purple-600' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {getDisplayName()?.charAt(0).toUpperCase()}
            </div>
            {isOnline() && (
              <Circle size={12} className="absolute bottom-0 right-0 bg-green-500 text-green-500 rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {getDisplayName()}
            </h3>
            <p className="text-xs text-gray-500">
              {conversation.conversationType === 'group'
                ? `${conversation.participants?.length || 0} members`
                : isOnline()
                ? 'Online'
                : 'Offline'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
