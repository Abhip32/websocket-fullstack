# Vercel Deployment Guide

## Environment Variables Setup

### For Vercel (Frontend)
Set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

### For Backend Server
Deploy your backend (Node.js server) to a platform like:
- Railway
- Render
- DigitalOcean
- AWS/Heroku

Set these environment variables on your backend:

```
MONGODB_URI=your-mongodb-connection-string
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=4000
JWT_SECRET=your-secure-jwt-secret
```

## Deployment Steps

1. **Deploy Backend First**
   - Deploy your `server/` directory to your chosen backend platform
   - Note the backend URL (e.g., `https://your-chat-backend.onrender.com`)

2. **Deploy Frontend to Vercel**
   - Push your code to GitHub
   - Connect your repo to Vercel
   - Set the environment variables in Vercel dashboard
   - Deploy

3. **Update Backend CORS**
   - Update `FRONTEND_URL` in your backend to match your Vercel app URL
   - Example: `https://your-chat-app.vercel.app`

## Important Notes

- **NEXT_PUBLIC_** prefix is required for client-side environment variables in Next.js
- Backend needs to be deployed separately (Vercel doesn't support persistent WebSocket connections)
- Make sure your backend supports HTTPS for production
- Update MongoDB URI to use a cloud database (MongoDB Atlas) for production