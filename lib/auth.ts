// Simple auth helper - in production, use NextAuth.js or similar
export function getCurrentUser() {
  // Mock user for demo - replace with actual auth
  return {
    id: 'creator-1',
    email: 'creator@example.com',
    name: 'John Creator',
    role: 'CREATOR' as const,
  };
}

export function getCurrentCustomer() {
  // Mock customer for demo
  return {
    id: 'user-1',
    email: 'customer@example.com',
    name: 'Jane Customer',
    role: 'USER' as const,
  };
}
