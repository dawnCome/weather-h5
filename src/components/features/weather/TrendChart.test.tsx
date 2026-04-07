import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TrendChart, { transformChartData } from './TrendChart';
import { DailyWeather } from '@/types/qweather';

describe('TrendChart', () => {
  it('should render chart with data', () => {
    const mockData: DailyWeather[] = [
      { fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' } as DailyWeather,
      { fxDate: '2026-04-08', tempMax: '22', tempMin: '12', textDay: '多云' } as DailyWeather,
    ];

    const { container } = render(<TrendChart data={mockData} />);
    // 验证组件外部容器存在
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should transform data correctly', () => {
    const mockData: DailyWeather[] = [
      { fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' } as DailyWeather,
      { fxDate: '2026-04-08', tempMax: '22', tempMin: '12', textDay: '多云' } as DailyWeather,
      { fxDate: '2026-04-09', tempMax: '25', tempMin: '15', textDay: '阴' } as DailyWeather,
    ];

    const result = transformChartData(mockData);

    expect(result).toEqual([
      { date: '04/07', max: 20, min: 10 },
      { date: '04/08', max: 22, min: 12 },
      { date: '04/09', max: 25, min: 15 },
    ]);
  });

  it('should render without crashing', () => {
    const mockData: DailyWeather[] = [
      { fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' } as DailyWeather,
    ];

    expect(() => render(<TrendChart data={mockData} />)).not.toThrow();
  });
});