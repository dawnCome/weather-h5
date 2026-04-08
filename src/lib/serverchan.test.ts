import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { sendWechatPush } from './serverchan';

const server = setupServer(
  http.post('https://sctapi.ftqq.com/:sendKey.send', async ({ request, params }) => {
    const { sendKey } = params;
    const { title, desp } = await request.json() as { title: string, desp: string };

    if (sendKey === 'VALID_KEY') {
      return HttpResponse.json({
        code: 0,
        message: 'success',
        data: { pushid: '123', readkey: 'abc' }
      });
    }

    return HttpResponse.json({
      code: 40001,
      message: 'invalid sendkey'
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('sendWechatPush', () => {
  it('should return true when push is successful', async () => {
    const result = await sendWechatPush('VALID_KEY', 'Test Title', 'Test Content');
    expect(result).toBe(true);
  });

  it('should return false when sendKey is invalid', async () => {
    const result = await sendWechatPush('INVALID_KEY', 'Test Title', 'Test Content');
    expect(result).toBe(false);
  });

  it('should return false when network error occurs', async () => {
    server.use(
      http.post('https://sctapi.ftqq.com/:sendKey.send', () => {
        return HttpResponse.error();
      })
    );
    const result = await sendWechatPush('VALID_KEY', 'Test Title', 'Test Content');
    expect(result).toBe(false);
  });

  it('should return false when server returns non-zero code', async () => {
    server.use(
      http.post('https://sctapi.ftqq.com/:sendKey.send', () => {
        return HttpResponse.json({ code: 1024, message: 'error' });
      })
    );
    const result = await sendWechatPush('VALID_KEY', 'Test Title', 'Test Content');
    expect(result).toBe(false);
  });
});
