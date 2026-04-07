import { describe, it, expect, vi } from 'vitest';
import { upsertSubscriber } from '@/lib/kv';
import { kv } from '@vercel/kv';

vi.mock('@vercel/kv', () => ({
  kv: {
    hset: vi.fn(),
    hgetall: vi.fn(),
    hdel: vi.fn()
  }
}));

describe('KV Store', () => {
  it('should upsert subscriber', async () => {
    const subscriber = { sendKey: 'key', locationId: '101', cityName: '北京' };
    await upsertSubscriber('user1', subscriber);
    expect(kv.hset).toHaveBeenCalledWith('subscribers', { 'user1': subscriber });
  });
});
