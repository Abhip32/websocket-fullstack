# Real-time Chat Application

A full-stack chat application built with Node.js, React, Socket.io, and MongoDB supporting one-on-one and group messaging with WhatsApp-like message status indicators.

## Features

- **One-on-One Chat**: Direct messaging between two users
- **Group Chat**: Multiple users in group conversations
- **Message Status Tracking**: 
  - ✓ Sent
  - ✓✓ Delivered
  - ✓✓ Read (shown in blue)
- **Online/Offline Status**: Real-time user availability
- **Typing Indicators**: See when someone is typing
- **User Authentication**: Simple username-based (no password required)
- **Persistent Storage**: MongoDB for message and conversation history
- **Real-time Updates**: Socket.io for instant communication

## Tech Stack

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Communication**: Socket.io (WebSockets)

## Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB running locally or connection string to MongoDB Atlas

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

This will install both frontend and backend dependencies.

### 2. Configure Environment Variables

Create/update `.env.local` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/chat-app
FRONTEND_URL=http://localhost:3000
PORT=4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app?retryWrites=true&w=majority
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create a cluster at mongodb.com/atlas
- Get your connection string
- Update MONGODB_URI in .env.local

### 4. Run the Application

```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend Server: http://localhost:4000

## Usage

### Starting a Chat

1. **Login**: Enter a unique username (no password needed)
2. **Create Conversation**:
   - Click the `+` button in the conversation list
   - Enter another user's username
   - Start messaging

### Message Status

- **✓ (Gray)**: Message sent to server
- **✓✓ (Gray)**: Message delivered to recipient's device
- **✓✓ (Blue)**: Message read by recipient

### Features in Action

**Typing Indicator**: See animated dots when someone is typing

**Online Status**: 
- Green dot next to user name = Online
- Last seen time = Offline

**Group Chat**: Create rooms with multiple participants

## API Endpoints

### Users
- `GET /api/users/online` - Get all online users
- `GET /api/users/:username` - Get user by username

### Conversations
- `POST /api/conversations/direct` - Create/get direct conversation
- `POST /api/conversations/group` - Create group conversation
- `GET /api/conversations/:conversationId/messages` - Get conversation messages
- `GET /api/users/:userId/conversations` - Get user's conversations

## Socket.io Events

### Client to Server

- `user:join` - User joins chat
- `message:send` - Send a message
- `message:delivered` - Mark message as delivered
- `message:read` - Mark message as read
- `conversation:join` - Join a conversation room
- `conversation:leave` - Leave a conversation
- `user:typing` - User is typing
- `user:stop-typing` - User stopped typing

### Server to Client

- `user:joined` - Confirmation user joined
- `message:new` - New message received
- `message:sent` - Message sent confirmation
- `message:delivered` - Message delivered acknowledgment
- `message:read` - Message read acknowledgment
- `user:online` - User came online
- `user:offline` - User went offline
- `user:typing` - Someone is typing
- `user:stop-typing` - Someone stopped typing

## Testing Guide

### Test One-on-One Chat

1. Open two browser windows/tabs at http://localhost:3000
2. Login as "Alice" in tab 1, "Bob" in tab 2
3. In Alice's window:
   - Click `+` button
   - Enter "Bob"
   - Click "Start Chat"
4. Send a message from Alice
5. Observe Bob receiving it with status indicators

### Test Message Status

1. Send message from Alice
2. Watch status:
   - Immediately shows ✓ (sent)
   - Changes to ✓✓ when Bob's window loads the conversation (delivered)
   - Changes to ✓✓ in blue when Bob views the messages (read)

### Test Typing Indicator

1. Have Alice and Bob in a conversation
2. Alice starts typing in the message input
3. Bob sees "Alice is typing..." with animated dots
4. Alice stops typing for 1 second
5. Bob's indicator disappears

### Test Online/Offline Status

1. Alice and Bob chatting
2. Close Bob's browser or disconnect
3. Alice sees "Offline" and "Last seen X minutes ago"
4. Bob comes back online
5. Alice sees "Online" status update immediately

### Test Group Chat (Optional)

1. Create group via backend API:
```bash
curl -X POST http://localhost:4000/api/conversations/group \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Chat",
    "participants": ["user1", "user2", "user3"],
    "createdBy": "user1"
  }'
```

2. Multiple users can join and chat in the group

## Troubleshooting

### Connection Refused
- Check MongoDB is running
- Verify PORT in .env.local (default 4000)
- Check SOCKET_URL matches backend port

### Messages Not Sending
- Check browser console for errors
- Verify WebSocket connection in DevTools Network tab
- Ensure backend is running on correct port

### MongoDB Connection Error
- Check connection string in .env.local
- For MongoDB Atlas, whitelist your IP
- Verify database name in URI

### "Username already in use"
- MongoDB requires unique usernames
- In development, restart the app to reset

## File Structure

```
/app
  /page.tsx - Main chat page
  /layout.tsx - Root layout
  /globals.css - Global styles

/components/chat
  /Chat.jsx - Main chat component
  /LoginModal.jsx - Login screen
  /ConversationList.jsx - Conversation sidebar
  /ConversationItem.jsx - Individual conversation
  /ChatHeader.jsx - Chat header with user info
  /MessagesWindow.jsx - Message display area
  /MessageBubble.jsx - Individual message
  /MessageStatus.jsx - Status indicators
  /MessageInput.jsx - Message input field

/lib
  /useSocket.js - Socket.io hook
  /useChatState.js - Chat state management

/server
  /index.js - Express server & Socket.io
  /config/db.js - MongoDB connection
  /socket/handlers.js - Socket event handlers
  /models/User.js - User schema
  /models/Message.js - Message schema
  /models/Conversation.js - Conversation schema
```

## Development

### Adding Features

1. **New Message Type**: Update Message model and handlers
2. **New Socket Event**: Add to handlers.js and chat component listeners
3. **New UI Component**: Create in /components/chat and import in Chat.jsx

### Debugging

Enable console logs in development:
- Backend logs show `[SERVER]` and `[SOCKET]` prefixes
- Frontend uses standard console for errors

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel settings
4. Deploy

**Note**: For production, use MongoDB Atlas instead of local MongoDB

### Deploy Backend

Options:
- **Railway**: `npx railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`
- **DigitalOcean**: Deploy via App Platform

Ensure `FRONTEND_URL` CORS settings match your deployment domain.

## Future Enhancements

- Media/image sharing
- Message search
- Conversation muting
- User profiles with avatars
- Message reactions
- End-to-end encryption
- Voice/video calls
- Message pinning
- User presence history

## License

MIT
