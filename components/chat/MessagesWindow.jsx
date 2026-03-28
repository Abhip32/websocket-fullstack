import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

export const MessagesWindow = ({ messages, currentUserId, typingUsers, onMessageInView }) => {
  const endRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

      if (isNearBottom && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && onMessageInView) {
          onMessageInView(lastMessage.messageId);
        }
      }
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-1 bg-gradient-to-br from-white via-purple-50 to-white"
      onScroll={handleScroll}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-purple-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          
          {messages.map((message) => (
            <MessageBubble
              key={message._id || message.messageId}
              message={message}
              isOwn={message.senderId === currentUserId || message.senderId?._id === currentUserId}
              onMessageLoad={onMessageInView}
            />
          ))}
          {typingUsers.size > 0 && (
            <div className="flex gap-2 mb-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-xs text-gray-500">
                {Array.from(typingUsers)
                  .map((item) => item.split(':')[1])
                  .join(', ')}{' '}
                typing...
              </span>
            </div>
          )}
          <div ref={endRef} />
        </>
      )}
    </div>
  );
};
