import { useState, useCallback, useMemo } from 'react';

export const useChatState = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Set());

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessageStatus = useCallback((messageId, status, userId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.messageId === messageId
          ? {
              ...msg,
              status,
              deliveredTo: status === 'delivered' ? [...(msg.deliveredTo || []), userId] : msg.deliveredTo,
              readBy: status === 'read' ? [...(msg.readBy || []), userId] : msg.readBy,
            }
          : msg
      )
    );
  }, []);

  const addConversation = useCallback((conversation) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conversation._id);
      if (exists) return prev;
      return [...prev, conversation];
    });
  }, []);

  const setUserOnline = useCallback((userId, username, isOnline) => {
    setOnlineUsers((prev) => {
      const newMap = new Map(prev);
      if (isOnline) {
        newMap.set(userId, { username, isOnline: true });
      } else {
        newMap.delete(userId);
      }
      return newMap;
    });
  }, []);

  const addTypingUser = useCallback((userId, username) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${userId}:${username}`);
      return newSet;
    });
  }, []);

  const removeTypingUser = useCallback((userId) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      const toDelete = Array.from(newSet).find((item) => item.startsWith(userId));
      if (toDelete) newSet.delete(toDelete);
      return newSet;
    });
  }, []);

  return useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      conversations,
      setConversations,
      addConversation,
      selectedConversation,
      setSelectedConversation,
      messages,
      setMessages,
      addMessage,
      updateMessageStatus,
      onlineUsers,
      setUserOnline,
      typingUsers,
      addTypingUser,
      removeTypingUser,
    }),
    [
      currentUser,
      conversations,
      selectedConversation,
      messages,
      onlineUsers,
      typingUsers,
      addConversation,
      addMessage,
      updateMessageStatus,
      setCurrentUser,
      setConversations,
      setSelectedConversation,
      setMessages,
      setUserOnline,
      addTypingUser,
      removeTypingUser,
    ]
  );
};
