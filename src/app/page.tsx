"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapPin, Send, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [city, setCity] = useState('');
  const [sendKey, setSendKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // 初始化或读取持久化的 UID 和 SendKey
    let uid = localStorage.getItem('weather_uid');
    if (!uid) {
      uid = uuidv4();
      localStorage.setItem('weather_uid', uid);
    }
    const savedKey = localStorage.getItem('weather_sendkey');
    if (savedKey) setSendKey(savedKey);
    const savedCity = localStorage.getItem('weather_city');
    if (savedCity) setCity(savedCity);
  }, []);

  const handleSubscribe = async (action: 'subscribe' | 'delete' = 'subscribe') => {
    setLoading(true);
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

      if (!city || !sendKey) {
        setMessage({ type: 'error', text: '请填写城市和 Server酱 SendKey' });
        return;
      }

      // 1. 获取城市 ID
      const cityRes = await fetch(`/api/city?city=${encodeURIComponent(city)}`);
      if (!cityRes.ok) throw new Error('无法找到该城市');
      const cityInfo = await cityRes.json();

      if (!cityInfo || !cityInfo.id) {
        setMessage({ type: 'error', text: '未能识别城市，请尝试更准确的名称' });
        return;
      }

      // 2. 发送订阅请求
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

      // 3. 持久化本地配置
      localStorage.setItem('weather_sendkey', sendKey);
      localStorage.setItem('weather_city', cityInfo.name);
      setCity(cityInfo.name);

      setMessage({ type: 'success', text: `订阅成功！当前监控：${cityInfo.name}` });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || '操作失败，请稍后重试' });
    } finally {
      setLoading(false);
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
            <div className={`p-4 rounded-xl flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="城市 (如: 上海)"
                value={city}
                onChange={e => setCity(e.target.value)}
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
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={() => handleSubscribe('subscribe')}
              disabled={loading}
            >
              {loading ? '处理中...' : '开启/更新预警'}
            </button>

            <button
              className="w-full py-3 text-slate-400 font-medium text-sm hover:text-slate-600"
              onClick={() => handleSubscribe('delete')}
              disabled={loading}
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
