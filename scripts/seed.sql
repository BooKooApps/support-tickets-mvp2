-- Create initial categories
INSERT INTO categories (id, name, description, color) VALUES
('cat-1', 'Technical Issue', 'Problems with functionality or bugs', '#EF4444'),
('cat-2', 'Account Support', 'Account-related questions and issues', '#3B82F6'),
('cat-3', 'Billing', 'Payment and subscription inquiries', '#10B981'),
('cat-4', 'Feature Request', 'Suggestions for new features', '#8B5CF6'),
('cat-5', 'General Question', 'General inquiries and questions', '#6B7280');

-- Create sample users
INSERT INTO users (id, email, name, role) VALUES
('creator-1', 'creator@example.com', 'John Creator', 'CREATOR'),
('user-1', 'customer@example.com', 'Jane Customer', 'USER'),
('user-2', 'customer2@example.com', 'Bob Customer', 'USER');

-- Create settings for creator
INSERT INTO settings (id, "userId", "agentName", "welcomeMessage", "autoMessage") VALUES
('settings-1', 'creator-1', 'Support Team', 'Welcome to our support! How can we help you today?', 'Thank you for your message. We''ll get back to you shortly.');

-- Create sample tickets
INSERT INTO tickets (id, title, description, status, "creatorId", "categoryId", "createdAt") VALUES
('ticket-1', 'Login Issues', 'I cannot log into my account', 'OPEN', 'user-1', 'cat-2', NOW() - INTERVAL '2 hours'),
('ticket-2', 'Payment Failed', 'My payment was declined but I was charged', 'CLAIMED', 'user-2', 'cat-3', NOW() - INTERVAL '1 day'),
('ticket-3', 'Feature Request', 'Can you add dark mode?', 'CLOSED', 'user-1', 'cat-4', NOW() - INTERVAL '3 days');

-- Update ticket-2 to be claimed by creator
UPDATE tickets SET "agentId" = 'creator-1', "claimedAt" = NOW() - INTERVAL '23 hours' WHERE id = 'ticket-2';

-- Update ticket-3 to be closed
UPDATE tickets SET "agentId" = 'creator-1', "claimedAt" = NOW() - INTERVAL '2 days', "closedAt" = NOW() - INTERVAL '1 day' WHERE id = 'ticket-3';

-- Create sample messages
INSERT INTO messages (id, content, "ticketId", "senderId", "createdAt") VALUES
('msg-1', 'I cannot log into my account', 'ticket-1', 'user-1', NOW() - INTERVAL '2 hours'),
('msg-2', 'My payment was declined but I was charged', 'ticket-2', 'user-2', NOW() - INTERVAL '1 day'),
('msg-3', 'I''ll look into this right away. Can you provide your transaction ID?', 'ticket-2', 'creator-1', NOW() - INTERVAL '23 hours'),
('msg-4', 'Can you add dark mode?', 'ticket-3', 'user-1', NOW() - INTERVAL '3 days'),
('msg-5', 'Great suggestion! We''ll add this to our roadmap.', 'ticket-3', 'creator-1', NOW() - INTERVAL '2 days');

-- Create sample review
INSERT INTO reviews (id, rating, feedback, "ticketId", "userId") VALUES
('review-1', 5, 'Great support! Very helpful and quick response.', 'ticket-3', 'user-1');
