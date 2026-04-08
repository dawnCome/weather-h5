# 天气看板 (Weather Dashboard) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking。

**Goal:** 在 H5 应用中增加天气看板，展示当前天气、7天预报图表及灾害预警，并支持自动定位。

**Architecture:** 使用 Zustand 管理天气状态，通过 `/api/weather` 接口整合和风天气数据，前端采用移动端优先的响应式设计。

**Tech Stack:** Next.js 15, Tailwind CSS v4, Zustand, Recharts, Lucide React, Vitest.

---

### Task 1: 验证类型定义模块 (`src/types/qweather.ts`)

**Files:**
- Verify: `src/types/qweather.ts`

- [ ] **Step 1: 验证类型定义**
检查 `src/types/qweather.ts` 是否包含以下接口:
- `DailyWeather`
- `WeatherWarning`
- `Weather7DResponse`
- `WarningResponse`

- [ ] **Step 2: Commit (如果需要)**
```bash
git add src/types/qweather.ts
git commit -m "chore: verify qweather type definitions"
```

---

### Task 2: 建立 Zustand 状态管理 (`src/stores/weatherStore.ts`)

**Files:**
- Create: `src/stores/weatherStore.ts`
- Test: `src/stores/weatherStore.test.ts`

- [ ] **Step 1: 编写失败的测试**
创建 `src/stores/weatherStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useWeatherStore } from './weatherStore';

describe('WeatherStore', () => {
  beforeEach(() => {
    useWeatherStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const state = useWeatherStore.getState();
    expect(state.weatherData).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('should set weather data', () => {
    const mockData = { city: '北京', daily: [], warning: [], updateTime: '' };
    useWeatherStore.getState().setWeatherData(mockData);
    expect(useWeatherStore.getState().weatherData).toEqual(mockData);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**
运行: `pnpm vitest run src/stores/weatherStore.test.ts`
期望: FAIL (找不到模块)

- [ ] **Step 3: 编写最小实现**
创建 `src/stores/weatherStore.ts`:
```typescript
import { create } from 'zustand';
import { DailyWeather, WeatherWarning } from '@/types/qweather';

export interface WeatherDashboardData {
  city: string;
  daily: DailyWeather[];
  warning: WeatherWarning[];
  updateTime: string;
}

interface WeatherState {
  weatherData: WeatherDashboardData | null;
  loading: boolean;
  setWeatherData: (data: WeatherDashboardData | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weatherData: null,
  loading: false,
  setWeatherData: (weatherData) => set({ weatherData }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ weatherData: null, loading: false }),
}));
```

- [ ] **Step 4: 运行测试验证通过**
运行: `pnpm vitest run src/stores/weatherStore.test.ts`
期望: PASS

- [ ] **Step 5: Commit**
```bash
git add src/stores/weatherStore.ts src/stores/weatherStore.test.ts
git commit -m "feat: add weather store using zustand with strict typing"
```

---

### Task 3: 开发整合天气 API (`src/app/api/weather/route.ts`)

**Files:**
- Create: `src/app/api/weather/route.ts`
- Test: `src/app/api/weather/route.test.ts`

- [ ] **Step 1: 编写 API 处理器**
创建 `src/app/api/weather/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getWeather7D, getWarnings, getCityId } from '@/lib/qweather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location'); // lon,lat
  const locationId = searchParams.get('locationId');

  try {
    let targetId = locationId;
    let cityName = '';

    if (location && !targetId) {
      const cityInfo = await getCityId(location);
      if (cityInfo) {
        targetId = cityInfo.id;
        cityName = cityInfo.name;
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const [weatherRes, warningRes] = await Promise.all([
      getWeather7D(targetId),
      getWarnings(targetId)
    ]);

    return NextResponse.json({
      city: cityName || '当前城市',
      daily: weatherRes.daily || [],
      warning: warningRes.warning || [],
      updateTime: weatherRes.updateTime || ''
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 编写测试**
创建 `src/app/api/weather/route.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { getWeather7D, getWarnings, getCityId } from '@/lib/qweather';

vi.mock('@/lib/qweather', () => ({
  getWeather7D: vi.fn(),
  getWarnings: vi.fn(),
  getCityId: vi.fn(),
}));

describe('Weather API', () => {
  it('should return weather data for valid location', async () => {
    vi.mocked(getCityId).mockResolvedValueOnce({ id: '101010100', name: '北京' });
    vi.mocked(getWeather7D).mockResolvedValueOnce({ daily: [{ fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' }] } as any);
    vi.mocked(getWarnings).mockResolvedValueOnce({ warning: [] } as any);

    const request = new Request('https://example.com/api/weather?location=116.4,39.9');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('city');
    expect(data).toHaveProperty('daily');
  });
});
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/weather/route.ts src/app/api/weather/route.test.ts
git commit -m "feat: add consolidated weather api route with tests"
```

---

### Task 4: 编写 UI 基础组件 (`src/components/ui/Alert.tsx` 和 `src/components/ui/Skeleton.tsx`)

**Files:**
- Create: `src/components/ui/Alert.tsx`
- Create: `src/components/ui/Skeleton.tsx`

- [ ] **Step 1: 编写 Alert 组件**
创建 `src/components/ui/Alert.tsx`:
```tsx
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

type AlertType = 'success' | 'info' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

const alertIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: XCircle,
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const Icon = alertIcons[type];

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${alertStyles[type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70" aria-label="Close">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 编写 Skeleton 组件**
创建 `src/components/ui/Skeleton.tsx`:
```tsx
export function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
  );
}

export function WeatherCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function TrendChartSkeleton() {
  return (
    <div className="w-full h-[25vh] mt-4">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/Alert.tsx src/components/ui/Skeleton.tsx
git commit -m "feat: add alert and skeleton UI components for loading and error states"
```

---

### Task 5: 编写气象趋势图组件 (`src/components/features/weather/TrendChart.tsx`)

**Files:**
- Create: `src/components/features/weather/TrendChart.tsx`
- Test: `src/components/features/weather/TrendChart.test.tsx`

- [ ] **Step 1: 编写组件**
创建 `src/components/features/weather/TrendChart.tsx`:
```tsx
"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyWeather } from '@/types/qweather';

export default function TrendChart({ data }: { data: DailyWeather[] }) {
  const chartData = data.map(item => ({
    date: item.fxDate.split('-').slice(1).join('/'),
    max: parseInt(item.tempMax),
    min: parseInt(item.tempMin),
  }));

  return (
    <div className="w-full h-[25vh] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} label={{ position: 'top', fontSize: 10, fill: '#ef4444' }} />
          <Line type="monotone" dataKey="min" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} label={{ position: 'bottom', fontSize: 10, fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: 编写测试**
创建 `src/components/features/weather/TrendChart.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrendChart from './TrendChart';
import { DailyWeather } from '@/types/qweather';

describe('TrendChart', () => {
  it('should render chart with data', () => {
    const mockData: DailyWeather[] = [
      { fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' } as DailyWeather,
      { fxDate: '2026-04-08', tempMax: '22', tempMin: '12', textDay: '多云' } as DailyWeather,
    ];

    render(<TrendChart data={mockData} />);
    // 验证图表渲染
    expect(screen.queryByText(/20/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Commit**
```bash
git add src/components/features/weather/TrendChart.tsx src/components/features/weather/TrendChart.test.tsx
git commit -m "feat: add weather trend chart component using vh units with tests"
```

---

### Task 6: 编写天气详情卡片 (`src/components/features/weather/WeatherCard.tsx`)

**Files:**
- Create: `src/components/features/weather/WeatherCard.tsx`
- Test: `src/components/features/weather/WeatherCard.test.tsx`

- [ ] **Step 1: 编写组件**
创建 `src/components/features/weather/WeatherCard.tsx`:
```tsx
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, AlertTriangle, LucideIcon } from 'lucide-react';
import { WeatherDashboardData } from '@/stores/weatherStore';

const iconMap: Record<string, LucideIcon> = {
  '晴': Sun,
  '多云': Cloud,
  '阴': Cloud,
  '雨': CloudRain,
  '雷': CloudLightning,
  '雪': CloudSnow,
  '风': Wind,
};

function getWeatherIcon(text: string) {
  for (const key in iconMap) {
    if (text.includes(key)) return iconMap[key];
  }
  return Cloud;
}

export default function WeatherCard({ data }: { data: WeatherDashboardData }) {
  const today = data.daily[0];
  const warning = data.warning[0];
  const WeatherIcon = getWeatherIcon(today.textDay);

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {data.city}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{today.textDay} · 今日 {today.tempMin}° / {today.tempMax}°</p>
        </div>
        <div className="flex flex-col items-end">
          <WeatherIcon className="w-8 h-8 text-blue-500 mb-1" />
          <div className="text-3xl font-light text-blue-600 tracking-tighter">{today.tempMax}°</div>
        </div>
      </div>

      {warning && (
        <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2 text-xs border border-amber-100">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-medium line-clamp-1">{warning.title}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 编写测试**
创建 `src/components/features/weather/WeatherCard.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherCard from './WeatherCard';
import { WeatherDashboardData } from '@/stores/weatherStore';

describe('WeatherCard', () => {
  it('should render weather data', () => {
    const mockData: WeatherDashboardData = {
      city: '北京',
      daily: [{ fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' } as any],
      warning: [],
      updateTime: '',
    };

    render(<WeatherCard data={mockData} />);
    expect(screen.getByText('北京')).toBeInTheDocument();
    expect(screen.getByText(/晴/)).toBeInTheDocument();
  });

  it('should display warning when present', () => {
    const mockData: WeatherDashboardData = {
      city: '上海',
      daily: [{ fxDate: '2026-04-07', tempMax: '15', tempMin: '5', textDay: '小雨' } as any],
      warning: [{ title: '暴雨黄色预警' } as any],
      updateTime: '',
    };

    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/暴雨黄色预警/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Commit**
```bash
git add src/components/features/weather/WeatherCard.tsx src/components/features/weather/WeatherCard.test.tsx
git commit -m "feat: add weather details card with icon mapping and strict types with tests"
```

---

### Task 7: 集成到主页面并支持自动定位 (`src/app/page.tsx`)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 引入并更新主页面**
修改 `src/app/page.tsx` 集成所有功能:
```tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapPin, Send, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWeatherStore } from '@/stores/weatherStore';
import WeatherCard from '@/components/features/weather/WeatherCard';
import TrendChart from '@/components/features/weather/TrendChart';
import { WeatherCardSkeleton, TrendChartSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';

export default function Home() {
  const [cityInput, setCityInput] = useState('');
  const [sendKey, setSendKey] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { weatherData, loading, setWeatherData, setLoading } = useWeatherStore();

  const fetchWeather = useCallback(async (params: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/weather?${params}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      if (data.daily) {
        setWeatherData(data);
        localStorage.setItem('weather_city', data.city);
        setCityInput(data.city);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: '获取天气数据失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setWeatherData]);

  useEffect(() => {
    // 1. 初始化用户标识
    let uid = localStorage.getItem('weather_uid');
    if (!uid) {
      uid = uuidv4();
      localStorage.setItem('weather_uid', uid);
    }
    const savedKey = localStorage.getItem('weather_sendkey');
    if (savedKey) setSendKey(savedKey);
    const savedCity = localStorage.getItem('weather_city');
    if (savedCity) setCityInput(savedCity);

    // 2. 尝试定位或加载上次保存的城市
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(`location=${position.coords.longitude},${position.coords.latitude}`);
        },
        () => {
          if (savedCity) fetchWeather(`location=${encodeURIComponent(savedCity)}`);
        }
      );
    }
  }, [fetchWeather]);

  const handleSubscribe = async (action: 'subscribe' | 'delete' = 'subscribe') => {
    setSubmitLoading(true);
    setMessage(null);

    try {
      const uid = localStorage.getItem('weather_uid');

      if (action === 'delete') {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, action: 'delete' })
        });
        if (!res.ok) throw new Error('Unsubscribe failed');
        setMessage({ type: 'success', text: '已取消订阅' });
        return;
      }

      if (!cityInput || !sendKey) {
        setMessage({ type: 'error', text: '请填写城市和 Server酱 SendKey' });
        return;
      }

      const cityRes = await fetch(`/api/city?city=${encodeURIComponent(cityInput)}`);
      if (!cityRes.ok) throw new Error('无法找到该城市');
      const cityInfo = await cityRes.json();

      if (!cityInfo || !cityInfo.id) {
        setMessage({ type: 'error', text: '未能识别城市，请尝试更准确的名称' });
        return;
      }

      const subscribeRes = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          sendKey,
          locationId: cityInfo.id,
          cityName: cityInfo.name
        })
      });

      if (!subscribeRes.ok) throw new Error('订阅请求失败');

      localStorage.setItem('weather_sendkey', sendKey);
      localStorage.setItem('weather_city', cityInfo.name);
      setCityInput(cityInfo.name);
      fetchWeather(`location=${encodeURIComponent(cityInfo.name)}`);

      setMessage({ type: 'success', text: `订阅成功！当前监控：${cityInfo.name}` });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || '操作失败，请稍后重试' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 text-black">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden mt-8">
        <div className="bg-blue-600 p-8 text-white text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl font-bold">气象异动预警</h1>
          <p className="mt-2 text-blue-100 text-sm">今明天气温骤降、转雨雪时及时提醒</p>
        </div>

        <div className="p-8 space-y-6">
          {message && (
            <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
          )}

          {loading ? (
            <div className="space-y-4">
              <WeatherCardSkeleton />
              <TrendChartSkeleton />
            </div>
          ) : weatherData && (
            <div className="space-y-4">
              <WeatherCard data={weatherData} />
              <TrendChart data={weatherData.daily} />
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="城市 (如: 上海)"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
              />
            </div>

            <div className="relative">
              <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="Server酱 SendKey"
                type="password"
                value={sendKey}
                onChange={e => setSendKey(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                submitLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={() => handleSubscribe('subscribe')}
              disabled={submitLoading}
            >
              {submitLoading ? '处理中...' : '开启/更新预警'}
            </button>

            <button
              className="w-full py-3 text-slate-400 font-medium text-sm hover:text-slate-600"
              onClick={() => handleSubscribe('delete')}
              disabled={submitLoading}
            >
              取消已有订阅
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 leading-relaxed">
              * 提示：Server酱 SendKey 可在 <a href="https://sct.ftqq.com/" target="_blank" rel="noreferrer" className="text-blue-500 underline">sct.ftqq.com</a> 获取。开启后，每当探测到极端天气异动，我们将通过微信向您推送提醒。
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-8 text-slate-300 text-xs">
        © 2026 Weather Alert H5 · Powered by QWeather & ServerChan
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: complete weather dashboard integration with auto-locating and skeleton UI"
```

---

### Task 8: 集成测试 (`src/app/page.integration.test.tsx`)

**Files:**
- Create: `src/app/page.integration.test.tsx`

- [ ] **Step 1: 编写集成测试**
创建 `src/app/page.integration.test.tsx`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './page';
import { useWeatherStore } from '@/stores/weatherStore';

describe('Home Integration', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear();
    useWeatherStore.getState().reset();
  });

  afterEach(() => {
    localStorage.clear();
    useWeatherStore.getState().reset();
  });

  it('should display weather data after successful fetch', async () => {
    // Mock fetch API
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        city: '北京',
        daily: [{ fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' }],
        warning: [],
        updateTime: ''
      })
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('北京')).toBeInTheDocument();
    });
  });

  it('should display warning alert when weather has warnings', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        city: '上海',
        daily: [{ fxDate: '2026-04-07', tempMax: '15', tempMin: '5', textDay: '小雨' }],
        warning: [{ title: '暴雨黄色预警' }],
        updateTime: ''
      })
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/暴雨黄色预警/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Commit**
```bash
git add src/app/page.integration.test.tsx
git commit -m "test: add integration tests for weather dashboard"
```