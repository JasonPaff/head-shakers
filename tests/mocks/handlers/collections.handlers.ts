import { http, HttpResponse } from 'msw';

/**
 * Collections-related API handlers for testing.
 */
export const collectionsHandlers = [
  // Get user's collections
  http.get('/api/collections', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    return HttpResponse.json({
      collections: [
        {
          coverImageUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
          description: 'My favorite sports bobbleheads',
          id: 'collection-1',
          isPublic: true,
          name: 'Sports Collection',
          slug: 'sports-collection',
          totalItems: 5,
          updatedAt: '2024-01-15T00:00:00Z',
          userId: userId ?? 'test-user-id',
        },
        {
          coverImageUrl: null,
          createdAt: '2024-02-01T00:00:00Z',
          description: 'Pop culture icons',
          id: 'collection-2',
          isPublic: false,
          name: 'Entertainment Collection',
          slug: 'entertainment-collection',
          totalItems: 3,
          updatedAt: '2024-02-15T00:00:00Z',
          userId: userId ?? 'test-user-id',
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 2,
        totalPages: 1,
      },
    });
  }),

  // Get single collection by ID
  http.get('/api/collections/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      coverImageUrl: null,
      createdAt: '2024-01-01T00:00:00Z',
      description: 'My favorite sports bobbleheads',
      id,
      isPublic: true,
      name: 'Sports Collection',
      slug: 'sports-collection',
      totalItems: 5,
      updatedAt: '2024-01-15T00:00:00Z',
      userId: 'test-user-id',
    });
  }),

  // Create collection
  http.post('/api/collections', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        coverImageUrl: null,
        createdAt: new Date().toISOString(),
        description: body.description ?? null,
        id: `collection-${Date.now()}`,
        isPublic: body.isPublic ?? true,
        name: body.name,
        slug: String(body.name).toLowerCase().replace(/\s+/g, '-'),
        totalItems: 0,
        updatedAt: new Date().toISOString(),
        userId: 'test-user-id',
      },
      { status: 201 },
    );
  }),

  // Update collection
  http.patch('/api/collections/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Delete collection
  http.delete('/api/collections/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
