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