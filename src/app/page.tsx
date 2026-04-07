"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { MapPin, Send, Bell, Locate, Loader2 } from "lucide-react";
import { useWeatherStore } from "@/stores/weatherStore";
import WeatherCard from "@/components/features/weather/WeatherCard";
import TrendChart from "@/components/features/weather/TrendChart";
import Alert from "@/components/ui/Alert";
import { WeatherCardSkeleton, TrendChartSkeleton } from "@/components/ui/Skeleton";
import type { WeatherResponse } from "@/types/qweather";

type MessageState = { type: "success" | "error" | "info" | "warning"; text: string } | null;

interface CityInfo {
  id: string;
  name: string;
}

/**
 * Try browser geolocation API and return "lon,lat" string, or null if unavailable.
 */
async function tryGeolocation(): Promise<string | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  return new Promise<string | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve(`${pos.coords.longitude},${pos.coords.latitude}`);
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });
}

export default function Home() {
  const [cityInput, setCityInput] = useState("");
  const [sendKey, setSendKey] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const { weatherData, loading, setWeatherData, setLoading } = useWeatherStore();

  // Initialize uid, sendKey, city from localStorage and try geolocation
  useEffect(() => {
    let uid = localStorage.getItem("weather_uid");
    if (!uid) {
      uid = uuidv4();
      localStorage.setItem("weather_uid", uid);
    }

    const savedKey = localStorage.getItem("weather_sendkey");
    if (savedKey) setSendKey(savedKey);

    const savedCity = localStorage.getItem("weather_city");
    if (savedCity) setCityInput(savedCity);

    // Try geolocation for auto-positioning; fallback to saved city.
    void tryGeolocation()
      .then(async (location) => {
        if (location) {
          await fetchWeather(location);
        } else if (savedCity) {
          await fetchWeather(undefined, savedCity);
        }
      })
      .catch(() => {
        if (savedCity) {
          void fetchWeather(undefined, savedCity);
        }
      });
  }, []);

  /**
   * Fetch weather data from our /api/weather endpoint.
   * Accepts either `location` ("lon,lat") or `locationId`.
   */
  const fetchWeather = useCallback(
    async (location?: string, locationId?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (location) params.set("location", location);
        if (locationId) params.set("locationId", locationId);

        const res = await fetch(`/api/weather?${params.toString()}`);
        if (!res.ok) {
          throw new Error("无法获取天气数据");
        }
        const data: WeatherResponse = await res.json();
        setWeatherData(data);
        localStorage.setItem("weather_city", data.city);
        setCityInput(data.city);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "获取天气数据失败";
        setMessage({ type: "error", text: msg });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setWeatherData],
  );

  /**
   * Handle subscribe or delete subscription.
   */
  const handleSubscribe = async (
    action: "subscribe" | "delete" = "subscribe",
  ) => {
    setSubmitLoading(true);
    setMessage(null);

    try {
      const uid = localStorage.getItem("weather_uid");
      if (!uid) throw new Error("用户标识未初始化");

      const body: Record<string, unknown> = { userId: uid };

      if (action === "delete") {
        body.action = "delete";
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("取消订阅失败");
        setMessage({ type: "success", text: "已取消订阅" });
        useWeatherStore.getState().reset();
        return;
      }

      if (!cityInput || !sendKey) {
        setMessage({
          type: "error",
          text: "请填写城市和 Server酱 SendKey",
        });
        return;
      }

      // 1. Get city ID from name
      const cityRes = await fetch(
        `/api/city?city=${encodeURIComponent(cityInput)}`,
      );
      if (!cityRes.ok) throw new Error("无法找到该城市");
      const cityInfo: CityInfo = await cityRes.json();

      if (!cityInfo?.id) {
        setMessage({ type: "error", text: "未能识别城市，请尝试更准确的名称" });
        return;
      }

      // 2. Send subscribe request
      body.sendKey = sendKey;
      body.locationId = cityInfo.id;
      body.cityName = cityInfo.name;

      const subscribeRes = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!subscribeRes.ok) throw new Error("订阅请求失败");

      // 3. Persist to localStorage
      localStorage.setItem("weather_sendkey", sendKey);
      localStorage.setItem("weather_city", cityInfo.name);
      setCityInput(cityInfo.name);

      setMessage({ type: "success", text: `订阅成功！当前监控：${cityInfo.name}` });

      // 4. Fetch weather for the subscribed city
      await fetchWeather(undefined, cityInfo.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "操作失败，请稍后重试";
      setMessage({ type: "error", text: msg });
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Search weather by the city input text.
   * Uses the /api/city endpoint to resolve the name to an ID first.
   */
  const handleSearch = async () => {
    if (!cityInput.trim()) {
      setMessage({ type: "info", text: "请输入城市名称" });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const cityRes = await fetch(
        `/api/city?city=${encodeURIComponent(cityInput.trim())}`,
      );
      if (!cityRes.ok) throw new Error("无法找到该城市");
      const cityInfo: CityInfo = await cityRes.json();

      if (!cityInfo?.id) {
        setMessage({ type: "error", text: "未能识别城市，请尝试更准确的名称" });
        return;
      }

      await fetchWeather(undefined, cityInfo.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "查询失败，请稍后重试";
      setMessage({ type: "error", text: msg });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-6 text-black">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <header className="bg-blue-600 rounded-3xl p-8 text-white text-center shadow-lg">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl font-bold">气象异动预警</h1>
          <p className="mt-2 text-blue-100 text-sm">
            今明天气温骤降、转雨雪时及时提醒
          </p>
        </header>

        {/* Alert messages */}
        {message && (
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <WeatherCardSkeleton />
            <TrendChartSkeleton />
          </div>
        )}

        {/* Weather dashboard (shown when data is available and not loading) */}
        {!loading && weatherData && (
          <div className="space-y-4">
            <WeatherCard data={weatherData} />
            <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 mb-2">
                未来趋势
              </h3>
              <TrendChart data={weatherData.daily} />
            </div>
          </div>
        )}

        {/* Search & Subscription */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="城市 (如: 上海)"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  disabled={submitLoading}
                  type="text"
                />
              </div>
              <button
                className="px-4 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors shrink-0 disabled:opacity-50"
                onClick={() => void handleSearch()}
                disabled={submitLoading}
                type="button"
                aria-label="搜索城市天气"
              >
                <Locate className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="Server酱 SendKey"
                type="password"
                value={sendKey}
                onChange={(e) => setSendKey(e.target.value)}
                disabled={submitLoading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
                onClick={() => void handleSubscribe("subscribe")}
                disabled={submitLoading}
                type="button"
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                {submitLoading ? "处理中..." : "开启/更新预警"}
              </button>
              <button
                className="px-5 py-4 rounded-xl text-slate-400 font-medium text-sm hover:text-slate-600 border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50"
                onClick={() => void handleSubscribe("delete")}
                disabled={submitLoading}
                type="button"
              >
                取消订阅
              </button>
            </div>
          </div>
        </section>

        {/* Footer hint */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            * 提示：Server酱 SendKey 可在{" "}
            <a
              href="https://sct.ftqq.com/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline"
            >
              sct.ftqq.com
            </a>{" "}
            获取。开启后，每当探测到极端天气异动，我们将通过微信向您推送提醒。
          </p>
        </section>
      </div>

      <footer className="mt-auto py-8 text-slate-300 text-xs">
        &copy; 2026 Weather Alert H5 &middot; Powered by QWeather &amp;
        ServerChan
      </footer>
    </main>
  );
}
