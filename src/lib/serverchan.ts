import { ServerChanResponse } from '@/types/serverchan';

/**
 * 发送微信推送 (Server酱)
 * @param sendKey Server酱 SendKey
 * @param title 标题
 * @param desp 描述 (支持 Markdown)
 * @returns 是否发送成功
 */
export async function sendWechatPush(sendKey: string, title: string, desp: string): Promise<boolean> {
  if (!sendKey || !title) {
    return false;
  }

  try {
    const res = await fetch(`https://sctapi.ftqq.com/${sendKey}.send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, desp }),
    });

    if (!res.ok) {
      return false;
    }

    const data: ServerChanResponse = await res.json();
    return data.code === 0;
  } catch (error) {
    console.error('Server酱推送失败:', error);
    return false;
  }
}
