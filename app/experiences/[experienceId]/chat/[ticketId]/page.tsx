'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  MessageCircle,
  Clock,
  User,
  ArrowLeft,
  Send,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getTimeAgo } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { Ticket, Category } from '@prisma/client';
import { useOnWebsocketMessage } from '@whop/react';

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  ticketId: string;
  senderId: string;
  username: string;
  sender: {
    id: string;
    name: string;
    role: 'USER' | 'CREATOR';
  };
};

type WebsocketMessage = {
  type: 'NEW_MESSAGE';
  ticketId: string;
  data: Message;
};

type TicketWithRelations = Ticket & {
  category: Category;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    ticketId: string;
    senderId: string;
    username: string;
  }>;
  _count: {
    messages: number;
  };
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.experienceId as string;
  const ticketId = params.ticketId as string;

  useOnWebsocketMessage(message => {
    if (message.isTrusted) {
      try {
        const websocketMessage: WebsocketMessage = JSON.parse(message.json);

        // Only handle NEW_MESSAGE type and for the current ticket
        if (
          websocketMessage.type === 'NEW_MESSAGE' &&
          websocketMessage.ticketId === ticketId &&
          websocketMessage.data
        ) {
          setMessages(prev => [...prev, websocketMessage.data]);
        }
      } catch (error) {
        console.error('Failed to parse websocket message:', error);
      }
    }
  });

  const [ticket, setTicket] = useState<TicketWithRelations | null>(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UI state
  const [isTicketInfoModalOpen, setIsTicketInfoModalOpen] = useState(false);

  // Get user info to determine role
  const {
    user,
    loading: userLoading,
    error: userError,
  } = useUser(experienceId);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setTicketLoading(true);
        setTicketError(null);

        const response = await fetch(`/api/tickets/${ticketId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket');
        }

        const ticketData = await response.json();
        setTicket(ticketData);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setTicketError(
          error instanceof Error ? error.message : 'Failed to load ticket'
        );
      } finally {
        setTicketLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        setMessagesError(null);

        const response = await fetch(`/api/tickets/${ticketId}/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const messagesData = await response.json();
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessagesError(
          error instanceof Error ? error.message : 'Failed to load messages'
        );
      } finally {
        setMessagesLoading(false);
      }
    };

    if (ticketId) {
      fetchMessages();
    }
  }, [ticketId]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);

      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessageData = await response.json();
      setMessages(prev => [...prev, newMessageData]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add a toast notification here
    } finally {
      setSendingMessage(false);
    }
  };

  const statusColor = {
    OPEN: 'bg-red-100 text-red-800',
    CLAIMED: 'bg-yellow-100 text-yellow-800',
    CLOSED: 'bg-green-100 text-green-800',
  };

  const priorityColor = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  const statusText = {
    OPEN: 'Waiting for support',
    CLAIMED: 'Being handled',
    CLOSED: 'Resolved',
  };

  // Show loading state
  if (userLoading || ticketLoading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-background z-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (userError || ticketError) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto p-6 max-w-4xl'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-center h-96'>
                <div className='text-center space-y-4'>
                  <AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
                  <div>
                    <h3 className='text-lg font-semibold'>
                      Error Loading Chat
                    </h3>
                    <p className='text-muted-foreground'>
                      {userError || ticketError || 'Something went wrong'}
                    </p>
                  </div>
                  <Button onClick={() => router.back()} variant='outline'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!ticket || !user) {
    return null;
  }

  // Determine appropriate back path based on user role
  const getBackPath = () => {
    if (user.accessLevel === 'admin') {
      return `/experiences/${experienceId}/creator/dashboard`;
    } else {
      return `/experiences/${experienceId}/customer`;
    }
  };

  return (
    <div className='bg-background flex flex-col h-screen'>
      {/* Fixed Back Button - Top Left Corner */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => router.push(getBackPath())}
        className='fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background/90'
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Dashboard
      </Button>

      {/* Ticket Information Modal */}
      <Dialog
        open={isTicketInfoModalOpen}
        onOpenChange={setIsTicketInfoModalOpen}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MessageCircle className='h-5 w-5' />
              Ticket Information
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-6'>
            {/* Ticket Details */}
            <div className='space-y-4'>
              <div className='flex items-start justify-between'>
                <div className='space-y-2 flex-1'>
                  <h2 className='text-2xl font-bold'>{ticket.title}</h2>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <User className='h-4 w-4' />
                      {ticket.username}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      {getTimeAgo(new Date(ticket.createdAt))}
                    </div>
                    <div className='flex items-center gap-1'>
                      <MessageCircle className='h-4 w-4' />
                      {ticket._count.messages} messages
                    </div>
                    {ticket.agentId && (
                      <div className='text-green-600 font-medium'>
                        Agent Assigned
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Badge className={statusColor[ticket.status]}>
                    {user.accessLevel === 'admin'
                      ? ticket.status
                      : statusText[ticket.status]}
                  </Badge>
                  {user.accessLevel === 'admin' && (
                    <Badge
                      variant='outline'
                      className={priorityColor[ticket.priority]}
                    >
                      {ticket.priority}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Category and Description */}
              <div className='space-y-2'>
                <Badge
                  variant='outline'
                  style={{
                    backgroundColor: ticket.category.color + '20',
                    color: ticket.category.color,
                  }}
                >
                  {ticket.category.name}
                </Badge>
                <div className='space-y-2'>
                  <h3 className='font-semibold'>Description:</h3>
                  <p className='text-muted-foreground bg-muted p-3 rounded-lg'>
                    {ticket.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Interface - Full Height */}
      <div className='flex-1 flex flex-col pb-[140px]'>
        {/* Messages Area */}
        <ScrollArea className='flex-1 p-6'>
          <div className='space-y-4'>
            {messagesError && (
              <div className='flex items-center justify-center p-4'>
                <div className='text-center text-red-500'>
                  <AlertCircle className='h-8 w-8 mx-auto mb-2' />
                  <p>{messagesError}</p>
                </div>
              </div>
            )}

            {!messagesError && messages.length === 0 && !messagesLoading && (
              <div className='flex items-center justify-center p-8'>
                <div className='text-center text-muted-foreground'>
                  <MessageCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            )}

            {messages.map(message => {
              const isCurrentUser = user && message.senderId === user.userId;
              const isCreator = message.sender.role === 'CREATOR';

              return (
                <div
                  key={message.id}
                  className={`flex mb-6 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : isCreator
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='text-xs font-medium'>
                        {isCurrentUser ? 'You' : message.sender.name}
                      </span>
                      {isCreator && !isCurrentUser && (
                        <Badge variant='outline' className='text-xs px-1 py-0'>
                          Creator
                        </Badge>
                      )}
                      <span className='text-xs opacity-70'>
                        {getTimeAgo(new Date(message.createdAt))}
                      </span>
                    </div>
                    <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Message Input - Bottom */}
      <div className='fixed bottom-0 left-0 right-0 bg-background border-t z-40 p-4'>
        <div className='max-w-4xl mx-auto space-y-3'>
          <form onSubmit={handleSendMessage}>
            <div className='relative flex items-end bg-muted rounded-2xl border border-border focus-within:border-primary/20 transition-colors'>
              <Textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder='Type your message...'
                className='flex-1 min-h-[60px] max-h-[160px] resize-none border-0 bg-transparent px-4 py-3 pr-24 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={sendingMessage}
              />

              {/* Right side buttons container */}
              <div className='absolute right-2 bottom-2 flex items-center gap-1'>
                {/* Ticket Info Toggle Button */}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsTicketInfoModalOpen(true)}
                  className='h-8 w-8 p-0 hover:bg-background/60'
                  title='Show ticket info'
                >
                  <Info className='h-4 w-4' />
                </Button>

                {/* Send Button */}
                <Button
                  type='submit'
                  size='sm'
                  disabled={!newMessage.trim() || sendingMessage}
                  className='h-8 w-8 p-0 rounded-full'
                >
                  {sendingMessage ? (
                    <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current' />
                  ) : (
                    <Send className='h-3 w-3' />
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Helper text and ticket info */}
          <div className='flex justify-between items-center text-xs text-muted-foreground px-1'>
            <span>Press Enter to send, Shift+Enter for new line</span>
            {ticket && (
              <div className='flex items-center gap-2'>
                <span>#{ticket.id.slice(0, 8)}</span>
                <Badge
                  variant='outline'
                  className={`text-xs ${statusColor[ticket.status]}`}
                >
                  {statusText[ticket.status]}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
