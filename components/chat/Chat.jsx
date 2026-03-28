'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AuthPage } from '@/components/AuthPage';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';
import { MessagesWindow } from './MessagesWindow';
import { MessageInput } from './MessageInput';
import { useChatState } from '@/lib/useChatState';
import { useSocket } from '@/lib/useSocket';
import { fetchWithToken } from '@/lib/fetchWithToken';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const Chat = () => {
  const socket = useSocket(SOCKET_URL);
  const chatState = useChatState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newConversationUsername, setNewConversationUsername] = useState('');

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        chatState.setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    }
  }, []);

  // Join chat with token
  const handleLogin = useCallback(async (user) => {
    if (!socket) return;

    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      socket.emit('user:join', { 
        username: user.username,
        userId: user.userId,
        token 
      });

      socket.once('user:joined', (data) => {
        chatState.setCurrentUser({
          userId: data.userId,
          username: data.username,
        });
        resolve();
      });

      socket.once('error', (error) => {
        reject(new Error(error.message));
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }, [socket, chatState]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (chatState.selectedConversation?._id === data.conversationId) {
        chatState.addMessage(data);

        // Auto-mark as delivered
        if (data.senderId !== chatState.currentUser?.userId) {
          socket.emit('message:delivered', {
            messageId: data.messageId,
            conversationId: data.conversationId,
          });
        }
      }
    };

    const handleMessageSent = (data) => {
      chatState.updateMessageStatus(data.messageId, data.status);
    };

    const handleMessageDelivered = (data) => {
      chatState.updateMessageStatus(data.messageId, 'delivered', data.deliveredTo);
    };

    const handleMessageRead = (data) => {
      chatState.updateMessageStatus(data.messageId, 'read', data.readBy);
    };

    const handleUserOnline = (data) => {
      chatState.setUserOnline(data.userId, data.username, true);
    };

    const handleUserOffline = (data) => {
      chatState.setUserOnline(data.userId, data.username, false);
    };

    const handleUserTyping = (data) => {
      if (chatState.selectedConversation?._id === data.conversationId) {
        chatState.addTypingUser(data.userId, data.username);
      }
    };

    const handleUserStopTyping = (data) => {
      if (chatState.selectedConversation?._id === data.conversationId) {
        chatState.removeTypingUser(data.userId);
      }
    };

    const handleConversationUpdated = (data) => {
      // Update or add the conversation in the list
      chatState.setConversations((prev) => {
        const existing = prev.find(c => c._id === data.conversation._id);
        
        if (existing) {
          // Update existing conversation
          return prev
            .map((conv) =>
              conv._id === data.conversation._id
                ? { ...conv, ...data.conversation }
                : conv
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          // Add new conversation to the list
          return [data.conversation, ...prev].sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        }
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('message:delivered', handleMessageDelivered);
    socket.on('message:read', handleMessageRead);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stop-typing', handleUserStopTyping);
    socket.on('conversation:updated', handleConversationUpdated);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('message:read', handleMessageRead);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stop-typing', handleUserStopTyping);
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, [socket, chatState, chatState.selectedConversation]);

  // Select conversation
  const handleSelectConversation = useCallback((conversation) => {
    chatState.setSelectedConversation(conversation);
    chatState.setMessages([]);

    if (socket && conversation._id) {
      socket.emit('conversation:join', { conversationId: conversation._id });

      // Load previous messages
      fetchWithToken(`${API_BASE_URL}/api/conversations/${conversation._id}/messages`)
        .then((res) => res.json())
        .then((messages) => {
          chatState.setMessages(messages);
        })
        .catch((error) => console.error('Error loading messages:', error));
    }
  }, [socket, chatState]);

  // Send message
  const handleSendMessage = useCallback((content) => {
    if (!socket || !chatState.selectedConversation || !chatState.currentUser) {
      return;
    }

    const messagePayload = {
      conversationId: chatState.selectedConversation._id,
      content,
      senderId: chatState.currentUser.userId,
    };

    socket.emit('message:send', messagePayload);
  }, [socket, chatState]);

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (socket && chatState.selectedConversation) {
      socket.emit('user:typing', {
        conversationId: chatState.selectedConversation._id,
      });
    }
  }, [socket, chatState.selectedConversation]);

  const handleStopTyping = useCallback(() => {
    if (socket && chatState.selectedConversation) {
      socket.emit('user:stop-typing', {
        conversationId: chatState.selectedConversation._id,
      });
    }
  }, [socket, chatState.selectedConversation]);

  // Create conversation
  const handleCreateConversation = useCallback(async () => {
    if (!newConversationUsername.trim() || !chatState.currentUser) return;

    try {
      // First, fetch the user by username to get their userId
      const userResponse = await fetchWithToken(
        `${API_BASE_URL}/api/users/${newConversationUsername.trim()}`
      );
      
      if (!userResponse.ok) {
        alert('User not found');
        return;
      }
      
      const targetUser = await userResponse.json();

      const response = await fetchWithToken(`${API_BASE_URL}/api/conversations/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId1: chatState.currentUser.userId,
          userId2: targetUser._id,
        }),
      });

      if (response.ok) {
        const conversation = await response.json();
        
        // Fetch full conversation data with participants
        const fullResponse = await fetchWithToken(
          `${API_BASE_URL}/api/users/${chatState.currentUser.userId}/conversations`
        );
        const conversations = await fullResponse.json();
        chatState.setConversations(conversations);

        // Find and select the new conversation
        const newConversation = conversations.find(c => c._id === conversation._id);
        if (newConversation) {
          handleSelectConversation(newConversation);
        }
        setNewConversationUsername('');
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }, [newConversationUsername, chatState, handleSelectConversation]);

  const { currentUser, setConversations } = chatState;

  // Load conversations on login
  useEffect(() => {
    if (!currentUser || !socket) return;

    fetchWithToken(`${API_BASE_URL}/api/users/${currentUser.userId}/conversations`)
      .then((res) => res.json())
      .then((conversations) => {
        setConversations(conversations);
      })
      .catch((error) => console.error('Error loading conversations:', error));
  }, [currentUser, socket, setConversations]);

  // Mark messages as read when visible
  const handleMessageInView = useCallback((messageId) => {
    if (!socket || !chatState.selectedConversation) return;

    socket.emit('message:read', {
      messageId,
      conversationId: chatState.selectedConversation._id,
    });
  }, [socket, chatState.selectedConversation]);

  if (!chatState.currentUser) {
    return <AuthPage onAuthSuccess={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* User Profile Bar - Purple Theme */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {chatState.currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold block">{chatState.currentUser.username}</span>
            <span className="text-xs text-purple-200">Online</span>
          </div>
        </div>
        <button
          onClick={() => {
            // Logout - disconnect socket and clear state
            if (socket) {
              socket.disconnect();
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            chatState.setCurrentUser(null);
            chatState.setConversations([]);
            chatState.setSelectedConversation(null);
            chatState.setMessages([]);
          }}
          className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition transform hover:scale-105 active:scale-95"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-1">
        <ConversationList
          conversations={chatState.conversations}
          selectedConversationId={chatState.selectedConversation?._id}
          onlineUsers={chatState.onlineUsers}
          currentUser={chatState.currentUser}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={() => setShowCreateDialog(true)}
        />

        <div className="flex-1 flex flex-col">
          <ChatHeader
            conversation={chatState.selectedConversation}
            onlineUsers={chatState.onlineUsers}
            currentUsername={chatState.currentUser.username}
          />

          {chatState.selectedConversation ? (
            <>
              <MessagesWindow
                messages={chatState.messages}
                currentUserId={chatState.currentUser.userId}
                typingUsers={chatState.typingUsers}
                onMessageInView={handleMessageInView}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                disabled={!chatState.selectedConversation}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Start New Conversation</h2>
            <input
              type="text"
              value={newConversationUsername}
              onChange={(e) => setNewConversationUsername(e.target.value)}
              placeholder="Enter username to chat with"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateConversation();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewConversationUsername('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
