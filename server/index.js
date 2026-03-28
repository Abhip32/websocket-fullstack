require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const socketHandlers = require('./socket/handlers');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const authMiddleware = require('./middleware/auth');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { userId: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { userId: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route example
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes

// Get all online users
app.get('/api/users/online', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).select('username isOnline lastSeen');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by username
app.get('/api/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get direct conversation between two users
app.post('/api/conversations/direct', async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    
    let conversation = await Conversation.findOne({
      conversationType: 'direct',
      participants: { $all: [userId1, userId2] },
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        conversationType: 'direct',
        participants: [userId1, userId2],
        createdBy: userId1,
      });
    }
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group conversation
app.post('/api/conversations/group', async (req, res) => {
  try {
    const { name, participants, createdBy } = req.body;
    
    const conversation = await Conversation.create({
      conversationType: 'group',
      name,
      participants,
      createdBy,
    });
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation messages
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate('senderId', 'username')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversations for a user
app.get('/api/users/:userId/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId,
    })
      .populate('participants', 'username isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`[SOCKET] New connection: ${socket.id}`);
  socketHandlers(io, socket);
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
