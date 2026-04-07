import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherCard from './WeatherCard';
import { WeatherDashboardData } from '@/stores/weatherStore';
import type { DailyWeather, WeatherWarning } from '@/types/qweather';

describe('WeatherCard', () => {
  const mockDaily: Partial<DailyWeather>[] = [
    { fxDate: '2026-04-07', tempMax: '20', tempMin: '10', textDay: '晴' } as Partial<DailyWeather>,
  ];

  it('should render weather data', () => {
    const mockData: WeatherDashboardData = {
      city: '北京',
      daily: mockDaily as DailyWeather[],
      warning: [],
      updateTime: '',
    };
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/北京/)).toBeInTheDocument();
    expect(screen.getByText(/晴/)).toBeInTheDocument();
  });

  it('should display warning when present', () => {
    const mockData: WeatherDashboardData = {
      city: '上海',
      daily: [{ ...mockDaily[0], textDay: '小雨' }] as DailyWeather[],
      warning: [{ title: '暴雨黄色预警' } as Partial<WeatherWarning>] as WeatherWarning[],
      updateTime: '',
    };
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText(/暴雨黄色预警/)).toBeInTheDocument();
  });
});
