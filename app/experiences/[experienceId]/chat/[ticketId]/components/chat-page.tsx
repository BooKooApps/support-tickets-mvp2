'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  AlertCircle,
  MessageCircle,
  ArrowLeft,
  Send,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getTimeAgo } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { Ticket, Category } from '@prisma/client';
import { useOnWebsocketMessage } from '@whop/react';
import {
  MessageWithRelations,
  WebsocketMessage,
} from '@/app/api/tickets/[id]/messages/route';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userTyping } from '../action/user-typing';

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

export default function ChatPage({
  accessLevel,
  experienceId,
  companyId,
  username,
  userId,
  ticketId,
}: {
  accessLevel: 'admin' | 'customer';
  experienceId: string;
  companyId: string;
  ticketId: string;
  username: string;
  userId: string;
}) {
  const router = useRouter();
  const [isTyping, setIsTyping] = useState({
    userId: '',
    username: '',
    isTyping: false,
  });

  // Typing indicator state and refs
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEventRef = useRef<number>(0);
  const [isTicketClosed, setIsTicketClosed] = useState(false);

  useOnWebsocketMessage(message => {
    if (message.isTrusted) {
      try {
        const websocketMessage: WebsocketMessage = JSON.parse(message.json);

        // only handle messages for the current company
        if (websocketMessage.companyId !== companyId) {
          return;
        }

        // only handle messages for the current ticket
        if (websocketMessage.ticketId !== ticketId) {
          return;
        }

        // if the message does not have data, return
        if (!websocketMessage.data) {
          return;
        }

        switch (websocketMessage.type) {
          case 'NEW_MESSAGE':
            setMessages(prev => [
              ...prev,
              websocketMessage.data as MessageWithRelations,
            ]);

            break;

          case 'TICKET_CLAIMED':
            // refresh the current data for both admin and customer

            break;
          case 'TICKET_CLOSED':
            // refresh the current data for both admin and customer
            setIsTicketClosed(true);
            break;
          case 'USER_TYPING':
            // not currently working
            const typingUserId = (websocketMessage.data as { userId: string })
              .userId;
            const typingUsername = (
              websocketMessage.data as { username: string }
            ).username;

            // Don't show typing indicator for current user
            if (typingUserId !== userId) {
              setIsTyping({
                userId: typingUserId,
                username: typingUsername,
                isTyping: true,
              });
            }
            break;
          case 'USER_STOP_TYPING':
            // not currently working
            const stoppedTypingUserId = (
              websocketMessage.data as { userId: string }
            ).userId;
            const stoppedTypingUsername = (
              websocketMessage.data as { username: string }
            ).username;

            // Don't update typing indicator for current user
            if (stoppedTypingUserId !== userId) {
              setIsTyping({
                userId: stoppedTypingUserId,
                username: stoppedTypingUsername,
                isTyping: false,
              });
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse websocket message:', error);
      }
    }
  });

  const [ticket, setTicket] = useState<TicketWithRelations | null>(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState<string | null>(null);
  // Improved typing logic with debouncing
  const sendTypingEvent = useCallback(
    async (typing: boolean) => {
      try {
        await userTyping({
          isTyping: typing,
          ticketId,
          experienceId,
          companyId,
          username,
          userId,
        });
        setIsCurrentUserTyping(typing);
      } catch (error) {
        console.error('Failed to send typing event:', error);
      }
    },
    [ticketId, experienceId, companyId, username, userId]
  );

  const handleInputChange = useCallback(
    async (value: string) => {
      setNewMessage(value);

      const now = Date.now();
      const isEmpty = value.trim() === '';

      // If input is empty, immediately stop typing
      if (isEmpty) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        if (isCurrentUserTyping) {
          await sendTypingEvent(false);
        }
        return;
      }

      // If not currently typing, start typing
      if (!isCurrentUserTyping) {
        await sendTypingEvent(true);
        lastTypingEventRef.current = now;
      }

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set a timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        if (isCurrentUserTyping) {
          await sendTypingEvent(false);
        }
      }, 3000);

      lastTypingEventRef.current = now;
    },
    [isCurrentUserTyping, sendTypingEvent]
  );

  // Chat state
  const [messages, setMessages] = useState<MessageWithRelations[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticket) {
      setIsTicketClosed(ticket.status === 'CLOSED');
    }
  }, [ticket]);

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

        const response = await fetch(
          `/api/tickets/${ticketId}?experienceId=${experienceId}`
        );
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

        const response = await fetch(
          `/api/tickets/${ticketId}/messages?experienceId=${experienceId}`
        );
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

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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

      const response = await fetch(
        `/api/tickets/${ticketId}/messages?experienceId=${experienceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');

      // Clear typing status when message is sent
      if (isCurrentUserTyping) {
        await sendTypingEvent(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
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
                  <AlertCircle className='h-12 w-12 text-destructive mx-auto' />
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

  return (
    <>
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
              const isCurrentUser = user && message.user?.id === user.userId;
              const isAgent = !!message.agent;
              const isOtherUser = !isCurrentUser && !isAgent;
              const isCreator = message.user?.id === ticket.creatorId;

              // Avatar and name logic
              let avatarUrl = '';
              let displayName = '';
              let badge = null;

              if (isCurrentUser) {
                avatarUrl = message.user?.avatarUrl || '';
                displayName = message.user?.username || 'You';
              } else if (isAgent) {
                avatarUrl = '';
                displayName = message.agent?.agentName || 'Agent';
                badge = (
                  <Badge variant='outline' className='text-xs px-1 py-0'>
                    Agent
                  </Badge>
                );
              } else if (isOtherUser) {
                avatarUrl = message.user?.avatarUrl || '';
                displayName = message.user?.username || 'User';
                if (isCreator) {
                  badge = null;
                }
              }

              return (
                <div
                  key={message.id}
                  className={`flex mb-6 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Left side avatar for agent/other user, right side for current user */}
                  {!isCurrentUser && (
                    <div className='flex flex-col items-center mr-3'>
                      {isAgent ? (
                        <Smile className='h-8 w-8 text-muted-foreground' />
                      ) : (
                        <Avatar className='h-8 w-6 sm:h-8 sm:w-6 md:h-10 md:w-8'>
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className='text-xs'>
                            {displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : isAgent
                          ? 'bg-muted text-muted-foreground'
                          : isCreator
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-2 ${isCurrentUser ? 'justify-end' : ''}`}
                    >
                      <span className='text-xs font-medium'>{displayName}</span>
                      {badge}
                      <span className='text-xs opacity-70'>
                        {getTimeAgo(new Date(message.createdAt))}
                      </span>
                    </div>
                    <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
                      {message.content}
                    </p>
                  </div>
                  {isCurrentUser && (
                    <div className='flex flex-col items-center ml-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className='text-xs'>
                          {displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
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
          {/* Typing Indicator */}
          {isTyping.isTyping && isTyping.userId !== userId && (
            <div className='flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground'>
              <div className='flex space-x-1'>
                <div className='w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                <div className='w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                <div className='w-2 h-2 bg-current rounded-full animate-bounce'></div>
              </div>
              <span>{isTyping.username} is typing...</span>
            </div>
          )}

          <form onSubmit={handleSendMessage}>
            <div className='relative flex items-end bg-muted rounded-2xl border border-border focus-within:border-primary/20 transition-colors'>
              <Textarea
                value={newMessage}
                onChange={e => handleInputChange(e.target.value)}
                placeholder={
                  isTicketClosed
                    ? 'This ticket has been closed'
                    : 'Type your message...'
                }
                className='flex-1 min-h-[60px] max-h-[160px] resize-none border-0 bg-transparent px-4 py-3 pr-24 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={sendingMessage || isTicketClosed}
              />

              {/* Right side buttons container */}
              <div className='absolute right-2 bottom-2 flex items-center gap-1'>
                {/* Send Button */}
                <Button
                  type='submit'
                  size='sm'
                  disabled={
                    !newMessage.trim() || sendingMessage || isTicketClosed
                  }
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
    </>
  );
}
