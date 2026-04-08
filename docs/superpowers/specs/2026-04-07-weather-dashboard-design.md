# 天气看板 (Weather Dashboard) 设计规范

## 1. 项目背景

在现有的天气预警订阅功能基础上，增加一个直观的天气看板，为用户提供实时的天气状况、气象灾害预警以及未来 7 天的气温趋势。该功能旨在提升 H5 应用的实用性，让用户在管理订阅的同时也能快速查看天气。

## 2. 核心功能设计

### 2.1 自动定位与数据获取
- **自动定位优先**:
  - 用户打开页面时，首先通过 `navigator.geolocation` 获取地理位置（经纬度）。
  - 若定位成功，通过经纬度调用接口获取城市信息及天气数据。
  - 若定位失败（拒绝或超时），回退到手动搜索/默认城市逻辑。
- **持久化记录**:
  - 记录用户最后一次查询或订阅的城市，下次访问时优先展示。

### 2.2 数据展示看板 (Dashboard UI)
- **瀑布流布局**: 采用单页垂直滚动布局，天气看板位于上方，订阅管理位于下方。
- **实时看板 (Real-time Banner)**:
  - 显示当前城市名称、实时温度、天气描述图标（如：晴、多云、小雨）。
  - 显示今日最高/最低气温。
- **气象预警条 (Warning Alerts)**:
  - 若当前城市有生效中的气象灾害预警，以醒目的颜色（如：黄色、橙色或红色背景）显示预警标题。
- **气温趋势图 (Temperature Trend Chart)**:
  - 使用 `recharts` 库绘制未来 7 天的气温折线图。
  - 包含两条曲线：最高气温（红色系）和最低气温（蓝色系）。
  - 图表需适配移动端宽度，支持横向查看或缩放。

## 3. 技术实现方案

### 3.1 前端组件 (Frontend Components)
- **容器组件**: `src/app/page.tsx` 作为主入口，管理全局加载状态和天气数据。
- **UI 组件**:
  - `components/features/weather/WeatherCard.tsx`: 实时天气卡片，使用 Tailwind v4 适配。
  - `components/features/weather/TrendChart.tsx`: 基于 `recharts` 的趋势图组件，需标记 `"use client"`。
  - `components/ui/Alert.tsx`: 通用的预警/提示组件。

### 3.2 后端 API (Backend API)
- **新增接口**: `GET /api/weather?location=lon,lat` 或 `GET /api/weather?locationId=ID`。
- **数据结构 (TypeScript)**:
  ```typescript
  interface DailyWeather {
    fxDate: string;
    tempMax: string;
    tempMin: string;
    textDay: string;
    iconDay: string;
  }
  interface WeatherWarning {
    title: string;
    type: string;
    level: string;
  }
  interface WeatherResponse {
    city: string;
    daily: DailyWeather[];
    warning: WeatherWarning[];
    updateTime: string;
  }
  ```

### 3.3 状态管理 (State Management)
- **Zustand Store**: 使用 `src/stores/weatherStore.ts` 管理当前天气数据、加载状态和定位信息。
  - 遵循 `CLAUDE.md` 规范，避免在页面组件中过度使用 `useState`。

## 4. 异常与性能处理
- **加载状态**: 优先使用 **骨架屏 (Skeleton Screens)** 替代简单的 Spinner。
- **响应式适配**: 严格禁止硬编码 `px`，所有布局尺寸应使用 `vw`/`vh` 或 Tailwind 工具类。
- **错误处理**: 若 API 调用失败，使用 `components/ui/Alert.tsx` 显示友好提示。

## 5. 测试要求
- **单元测试**:
  - 验证天气数据解析逻辑。
  - 验证趋势图数据转换函数。
- **集成测试**:
  - 模拟 API 返回不同天气状况（含预警和无预警）下的 UI 表现。
