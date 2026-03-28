import React from 'react';
import { ConversationItem } from './ConversationItem';
import { Plus } from 'lucide-react';

export const ConversationList = ({
  conversations,
  selectedConversationId,
  onlineUsers,
  onSelectConversation,
  onCreateConversation,
  currentUser,
}) => {
  return (
    <div className="w-80 border-r border-purple-200 flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <div className="p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-purple-900">Messages</h2>
          <button
            onClick={onCreateConversation}
            className="p-2 hover:bg-purple-200 bg-purple-100 rounded-lg transition transform hover:scale-110"
            title="New conversation"
          >
            <Plus size={20} className="text-purple-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4 text-center text-purple-500">
            <p>No conversations yet. Create one to get started!</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              currentUser={currentUser}
              isSelected={selectedConversationId === conversation._id}
              onlineUsers={onlineUsers}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
};
