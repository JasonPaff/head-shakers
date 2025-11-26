import { http, HttpResponse } from 'msw';

/**
 * Auth-related API handlers for testing.
 * These mock Clerk and auth-related endpoints.
 */
export const authHandlers = [
  // Mock user session endpoint
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      isSignedIn: true,
      user: {
        email: 'test@example.com',
        firstName: 'Test',
        id: 'test-user-id',
        imageUrl: 'https://example.com/avatar.jpg',
        lastName: 'User',
        username: 'testuser',
      },
    });
  }),

  // Mock user profile endpoint
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      bio: 'Bobblehead collector',
      createdAt: '2024-01-01T00:00:00Z',
      email: 'test@example.com',
      id: 'test-user-id',
      isAdmin: false,
      username: 'testuser',
    });
  }),
];
