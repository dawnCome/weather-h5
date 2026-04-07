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