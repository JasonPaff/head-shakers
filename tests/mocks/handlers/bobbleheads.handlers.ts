import { http, HttpResponse } from 'msw';

/**
 * Bobbleheads-related API handlers for testing.
 */
export const bobbleheadsHandlers = [
  // Get bobbleheads list
  http.get('/api/bobbleheads', ({ request }) => {
    const url = new URL(request.url);
    const collectionId = url.searchParams.get('collectionId');

    return HttpResponse.json({
      bobbleheads: [
        {
          acquisitionDate: '2024-01-15',
          collectionId: collectionId ?? 'collection-1',
          condition: 'mint',
          createdAt: '2024-01-15T00:00:00Z',
          description: 'Limited edition baseball player',
          id: 'bobblehead-1',
          isPublic: true,
          name: 'Baseball Star',
          photos: [],
          purchasePrice: 49.99,
          updatedAt: '2024-01-15T00:00:00Z',
          userId: 'test-user-id',
        },
        {
          acquisitionDate: '2024-02-20',
          collectionId: collectionId ?? 'collection-1',
          condition: 'excellent',
          createdAt: '2024-02-20T00:00:00Z',
          description: 'Basketball legend figure',
          id: 'bobblehead-2',
          isPublic: true,
          name: 'Basketball Legend',
          photos: [],
          purchasePrice: 39.99,
          updatedAt: '2024-02-20T00:00:00Z',
          userId: 'test-user-id',
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

  // Get single bobblehead
  http.get('/api/bobbleheads/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      acquisitionDate: '2024-01-15',
      collectionId: 'collection-1',
      condition: 'mint',
      createdAt: '2024-01-15T00:00:00Z',
      description: 'Limited edition baseball player',
      id,
      isPublic: true,
      name: 'Baseball Star',
      photos: [],
      purchasePrice: 49.99,
      updatedAt: '2024-01-15T00:00:00Z',
      userId: 'test-user-id',
    });
  }),

  // Create bobblehead
  http.post('/api/bobbleheads', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        ...body,
        createdAt: new Date().toISOString(),
        id: `bobblehead-${Date.now()}`,
        photos: [],
        updatedAt: new Date().toISOString(),
        userId: 'test-user-id',
      },
      { status: 201 },
    );
  }),

  // Update bobblehead
  http.patch('/api/bobbleheads/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Delete bobblehead
  http.delete('/api/bobbleheads/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Like/unlike bobblehead
  http.post('/api/bobbleheads/:id/like', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      isLiked: true,
      likeCount: 1,
      targetId: id,
    });
  }),
];
