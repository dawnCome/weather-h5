import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { getWeather7D, getWarnings, getCityId } from '@/lib/qweather';
import type { Weather7DResponse, WarningResponse } from '@/types/qweather';

vi.mock('@/lib/qweather', () => ({
  getWeather7D: vi.fn(),
  getWarnings: vi.fn(),
  getCityId: vi.fn(),
}));

describe('Weather API', () => {
  it('should return weather data for valid location', async () => {
    vi.mocked(getCityId).mockResolvedValueOnce({ id: '101010100', name: '北京' });
    vi.mocked(getWeather7D).mockResolvedValueOnce({
      code: '200',
      daily: [{ fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' }]
    } as Weather7DResponse);
    vi.mocked(getWarnings).mockResolvedValueOnce({
      code: '200',
      warning: []
    } as WarningResponse);

    const request = new Request('https://example.com/api/weather?location=116.4,39.9');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('city');
    expect(data).toHaveProperty('daily');
  });

  it('should return weather data for valid locationId', async () => {
    vi.mocked(getWeather7D).mockResolvedValueOnce({
      code: '200',
      daily: [{ fxDate: '2026-04-07', tempMax: '22', tempMin: '12', textDay: '多云' }],
      updateTime: '2026-04-07T12:00:00+08:00'
    } as Weather7DResponse);
    vi.mocked(getWarnings).mockResolvedValueOnce({
      code: '200',
      warning: []
    } as WarningResponse);

    const request = new Request('https://example.com/api/weather?locationId=101010100');
    const response = await GET(request);
    const data = await response.json();

    expect(data.city).toBe('当前城市');
    expect(data.daily).toHaveLength(1);
    expect(data.updateTime).toBe('2026-04-07T12:00:00+08:00');
  });

  it('should return 404 when location not found', async () => {
    vi.mocked(getCityId).mockResolvedValueOnce(null);

    const request = new Request('https://example.com/api/weather?location=0,0');
    const response = await GET(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 500 when API request fails', async () => {
    vi.mocked(getCityId).mockRejectedValueOnce(new Error('API Error'));

    const request = new Request('https://example.com/api/weather?location=116.4,39.9');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should include warning data when available', async () => {
    vi.mocked(getCityId).mockResolvedValueOnce({ id: '101010100', name: '上海' });
    vi.mocked(getWeather7D).mockResolvedValueOnce({
      code: '200',
      daily: []
    } as Weather7DResponse);
    vi.mocked(getWarnings).mockResolvedValueOnce({
      code: '200',
      warning: [{
        id: 'W1',
        sender: '气象台',
        pubTime: '2026-04-07T10:00:00+08:00',
        title: '暴雨蓝色预警',
        startTime: '2026-04-07T10:00:00+08:00',
        endTime: '2026-04-08T10:00:00+08:00',
        status: 'active',
        level: '蓝色',
        type: '暴雨',
        typeName: '暴雨',
        text: '预警内容',
        related: ''
      }]
    } as WarningResponse);

    const request = new Request('https://example.com/api/weather?location=121.47,31.23');
    const response = await GET(request);
    const data = await response.json();

    expect(data.warning).toHaveLength(1);
    expect(data.warning[0].title).toBe('暴雨蓝色预警');
  });
});