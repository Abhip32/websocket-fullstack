import React from 'react';
import { MessageStatus } from './MessageStatus';
import { formatDistanceToNow } from 'date-fns';

export const MessageBubble = ({ message, isOwn, onMessageLoad }) => {
  React.useEffect(() => {
    if (isOwn && onMessageLoad) {
      onMessageLoad(message.messageId);
    }
  }, [message.messageId, isOwn, onMessageLoad]);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-br-none shadow-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-purple-700 mb-1">
            {message.senderName || message.senderId?.username}
          </p>
        )}
        <p className="break-words">{message.content}</p>
        <div className={`flex items-center justify-between gap-2 mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        } text-xs`}>
          <span>
            {message.timestamp ? (() => {
              console.log('Timestamp:', message.timestamp);
              const date = new Date(message.timestamp);
              return Number.isNaN(date.getTime()) ? 'Invalid time' : formatDistanceToNow(date, { addSuffix: true });
            })() : 'Unknown time'}
          </span>
          {isOwn && (
            <MessageStatus
              status={message.status}
              deliveredTo={message.deliveredTo}
              readBy={message.readBy}
            />
          )}
        </div>
      </div>
    </div>
  );
};
