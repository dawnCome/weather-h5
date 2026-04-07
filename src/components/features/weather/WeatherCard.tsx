import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, AlertTriangle, type LucideIcon } from 'lucide-react';
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
  const today = data.daily[0] as NonNullable<typeof data.daily[number]> | null;
  if (!today) return null;
  const warning = data.warning[0];
  const WeatherIcon = getWeatherIcon(today.textDay);

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{data.city}</h2>
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
