# Quick Start Guide

Get the chat app running in 5 minutes!

## 1. Prerequisites
- Node.js 18+
- MongoDB running locally (or get connection string from MongoDB Atlas)

## 2. Install
```bash
pnpm install
```

## 3. Configure (if using MongoDB Atlas)
Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/chat-app
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## 4. Start
```bash
pnpm dev
```

Opens:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 5. Test It
- Open http://localhost:3000 in two browser tabs
- Tab 1: Login as "Alice"
- Tab 2: Login as "Bob"
- Tab 1: Click `+`, enter "Bob", click "Start Chat"
- Send messages and watch the status indicators!

## Features to Try
✓ **Send messages** - Watch the checkmarks change (sent → delivered → read)
✓ **Type** - Other person sees "typing..." indicator
✓ **Go offline** - Close browser, other person sees "Offline" status
✓ **Timestamps** - Messages show "just now" or "2 min ago"

## Troubleshooting

**"Cannot POST /api..."**
- Backend not running? Check `pnpm dev` started port 4000

**"connect ECONNREFUSED"**
- MongoDB not running? Start mongod or use MongoDB Atlas

**Messages not appearing?**
- Check browser console (F12) for errors
- Verify both users are in same conversation

## More Help
See `CHAT_SETUP.md` for detailed documentation and testing guide.
