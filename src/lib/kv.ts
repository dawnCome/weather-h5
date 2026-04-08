import { kv } from '@vercel/kv';

export interface Subscriber {
  sendKey: string;
  locationId: string;
  cityName: string;
}

/**
 * 添加或更新订阅者
 * @param userId 用户 ID (UUID)
 * @param data 订阅信息
 */
export async function upsertSubscriber(userId: string, data: Subscriber) {
  await kv.hset('subscribers', { [userId]: data });
}

/**
 * 删除订阅者
 * @param userId 用户 ID
 */
export async function deleteSubscriber(userId: string) {
  await kv.hdel('subscribers', userId);
}

/**
 * 获取所有订阅者
 * @returns 订阅者字典
 */
export async function getSubscribers(): Promise<Record<string, Subscriber>> {
  const data = await kv.hgetall('subscribers');
  return (data as Record<string, Subscriber>) || {};
}
