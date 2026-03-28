const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let onlineUsers = new Map(); // socketId -> userId

const socketHandlers = (io, socket) => {
  const joinedRooms = new Set();

  const joinConversationRoom = (conversationId) => {
    const room = `conversation:${conversationId}`;
    socket.join(room);
    joinedRooms.add(room);
    return room;
  };

  // User joins the chat
  socket.on('user:join', async (data) => {
    console.log(`[SOCKET] User joining with data:`, data);
    const { username } = data;
    console.log(`[SOCKET] User joining: ${username} - Socket: ${socket.id}`);
    
    try {
      // Check if username exists
      let user = await User.findOne({ username });
      
      if (!user) {
        // Create new user
        user = await User.create({
          username,
          socketId: socket.id,
          isOnline: true,
          lastSeen: new Date(),
        });
      } else {
        // Update existing user
        user.socketId = socket.id;
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
      }
      
      onlineUsers.set(socket.id, user._id.toString());
      socket.data.userId = user._id;
      socket.data.username = username;

      // Join rooms for every conversation this user participates in
      const userConversations = await Conversation.find({ participants: user._id }).select('_id');
      userConversations.forEach((conv) => {
        const room = joinConversationRoom(conv._id);
        io.to(room).emit('user:online', {
          userId: user._id,
          username,
          timestamp: new Date(),
        });
      });

      console.log(`[SOCKET] User ${username} joined - Socket: ${socket.id}`);
      socket.emit('user:joined', { userId: user._id, username });
    } catch (error) {
      console.error('[SOCKET] Error joining user:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // User sends a message
  socket.on('message:send', async (data) => {
    const { conversationId, content, recipientId, isGroupChat } = data;
    const senderId = socket.data.userId;
    const senderName = socket.data.username;
    
    if (!senderId || !senderName) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    try {
      // Create message document
      const message = await Message.create({
        conversationId,
        senderId,
        senderName,
        content,
        status: 'sent',
      });

      // Update conversation's lastMessage and updatedAt
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });

      // Fetch complete conversation data with populated participants
      const updatedConversation = await Conversation.findById(conversationId)
        .populate('participants', 'username isOnline lastSeen')
        .populate('lastMessage');

      const participantIds = updatedConversation.participants.map(p => p._id.toString());

      // Emit message sent acknowledgement to sender
      socket.emit('message:sent', {
        messageId: message._id,
        status: 'sent',
        timestamp: message.timestamp,
      });
      
      // Broadcast message to conversation room
      io.to(`conversation:${conversationId}`).emit('message:new', {
        messageId: message._id,
        conversationId,
        senderId,
        senderName,
        content,
        status: 'sent',
        timestamp: message.timestamp,
      });

      // Notify all participants to update their conversation lists
      for (let [socketId, userId] of onlineUsers) {
        const userIdStr = userId.toString();
        if (participantIds.includes(userIdStr)) {
          io.to(socketId).emit('conversation:updated', {
            conversation: updatedConversation,
          });
        }
      }
      
      console.log(`[SOCKET] Message from ${senderName}: ${content}`);
    } catch (error) {
      console.error('[SOCKET] Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // User joins a specific conversation room
  socket.on('conversation:join', async (data) => {
    const { conversationId } = data;
    const room = joinConversationRoom(conversationId);
    
    console.log(`[SOCKET] User ${socket.data.username} joined conversation: ${conversationId}`);
    
    // Notify others that user is in conversation (for delivery status)
    socket.broadcast.to(room).emit('user:in-conversation', {
      userId: socket.data.userId,
      username: socket.data.username,
    });

    // Notify room about online status
    io.to(room).emit('user:online', {
      userId: socket.data.userId,
      username: socket.data.username,
      timestamp: new Date(),
    });
  });

  // User leaves a conversation
  socket.on('conversation:leave', (data) => {
    const { conversationId } = data;
    const room = `conversation:${conversationId}`;
    socket.leave(room);
    joinedRooms.delete(room);

    console.log(`[SOCKET] User ${socket.data.username} left conversation: ${conversationId}`);

    io.to(room).emit('user:offline', {
      userId: socket.data.userId,
      username: socket.data.username,
      timestamp: new Date(),
    });
  });

  // Message delivered acknowledgement
  socket.on('message:delivered', async (data) => {
    const { messageId, conversationId } = data;
    const userId = socket.data.userId;
    
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          $addToSet: {
            deliveredTo: {
              userId,
              deliveredAt: new Date(),
            },
          },
        },
        { new: true }
      );
      
      // Broadcast delivery status
      io.to(`conversation:${conversationId}`).emit('message:delivered', {
        messageId,
        deliveredTo: userId,
        timestamp: new Date(),
      });
      
      console.log(`[SOCKET] Message ${messageId} delivered to ${socket.data.username}`);
    } catch (error) {
      console.error('[SOCKET] Error marking message as delivered:', error);
    }
  });

  // Message read acknowledgement
  socket.on('message:read', async (data) => {
    const { messageId, conversationId } = data;
    const userId = socket.data.userId;
    
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          $addToSet: {
            readBy: {
              userId,
              readAt: new Date(),
            },
          },
        },
        { new: true }
      );
      
      // Broadcast read status
      io.to(`conversation:${conversationId}`).emit('message:read', {
        messageId,
        readBy: userId,
        timestamp: new Date(),
      });
      
      console.log(`[SOCKET] Message ${messageId} read by ${socket.data.username}`);
    } catch (error) {
      console.error('[SOCKET] Error marking message as read:', error);
    }
  });

  // User typing indicator
  socket.on('user:typing', (data) => {
    const { conversationId } = data;
    
    socket.broadcast.to(`conversation:${conversationId}`).emit('user:typing', {
      userId: socket.data.userId,
      username: socket.data.username,
      conversationId,
    });
  });

  // User stopped typing
  socket.on('user:stop-typing', (data) => {
    const { conversationId } = data;
    
    socket.broadcast.to(`conversation:${conversationId}`).emit('user:stop-typing', {
      userId: socket.data.userId,
      conversationId,
    });
  });

  // Get online users in conversation
  socket.on('conversation:get-users', async (data) => {
    const { conversationId } = data;
    
    try {
      const conversation = await Conversation.findById(conversationId)
        .populate('participants', 'username isOnline lastSeen');
      
      if (conversation) {
        socket.emit('conversation:users', {
          users: conversation.participants,
        });
      }
    } catch (error) {
      console.error('[SOCKET] Error getting conversation users:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    const username = socket.data.username;
    const userId = socket.data.userId;

    onlineUsers.delete(socket.id);

    try {
      // Update user offline status
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null,
        });
      }

      // Broadcast user offline in rooms user belonged to
      joinedRooms.forEach((room) => {
        io.to(room).emit('user:offline', {
          userId,
          username,
          lastSeen: new Date(),
        });
      });

      console.log(`[SOCKET] User ${username} disconnected`);
    } catch (error) {
      console.error('[SOCKET] Error handling disconnect:', error);
    }
  });
};

module.exports = socketHandlers;
