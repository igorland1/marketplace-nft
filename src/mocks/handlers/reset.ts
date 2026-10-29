import { http, HttpResponse } from 'msw';
import { mockDb } from '../data/db';

export const resetHandler = [
  http.post('/api/test/reset', () => {
    mockDb.init();
    return HttpResponse.json({ success: true, message: 'Database reset to default fixtures' });
  }),
];
