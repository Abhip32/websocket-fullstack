import { Chat } from '@/components/chat/Chat';

export const metadata = {
  title: 'Chat App',
  description: 'Real-time chat application with Socket.io',
};

export default function Home() {
  return <Chat />;
}
