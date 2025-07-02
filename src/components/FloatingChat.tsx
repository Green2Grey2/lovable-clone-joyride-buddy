
import { useState } from 'react';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  isStepShare: boolean;
}

interface FloatingChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  departmentName: string;
  userName: string;
  unreadCount: number;
}

export const FloatingChat = ({ 
  messages, 
  onSendMessage, 
  departmentName, 
  userName,
  unreadCount 
}: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <>
      {/* Floating Chat Button - positioned to not conflict with bottom nav */}
      <div className="fixed bottom-32 right-6 z-40">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-4 border-white"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs flex items-center justify-center animate-bounce shadow-lg border-2 border-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Chat Modal - positioned above bottom nav */}
      {isOpen && (
        <div className="fixed bottom-48 right-6 w-80 h-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{departmentName}</h3>
                  <p className="text-xs opacity-90">{messages.length} messages</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.slice(0, 8).map((msg) => (
              <div 
                key={msg.id} 
                className={`${
                  msg.user === userName
                    ? 'ml-6'
                    : 'mr-6'
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs shadow-lg ${
                  msg.user === userName
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : msg.isStepShare
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200/50 text-gray-800'
                    : 'bg-white border border-gray-100 text-gray-800'
                }`}>
                  {msg.user !== userName && (
                    <p className="font-bold text-xs mb-1 opacity-70">{msg.user}</p>
                  )}
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.user === userName ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white/50">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 text-xs border-gray-200 focus:border-purple-400 rounded-xl bg-white/80"
              />
              <Button
                onClick={handleSend}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-3 shadow-lg"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
