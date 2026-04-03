# Weather H5 App Design Specification

## 1. Project Context
A Next.js (App Router) based H5 application that provides a 7-day weather forecast and sends proactive WeChat notifications for extreme weather changes (sudden temperature drops, storms, etc.). It targets individual developers and small groups, utilizing Server酱 for WeChat notifications and QWeather (和风天气) for weather data.

## 2. Architecture & Tech Stack
- **Framework**: Next.js (App Router) with React.
- **Styling**: Tailwind CSS for responsive mobile-first UI.
- **Data Storage**: Vercel KV (Redis) to store multi-user subscription data.
- **Deployment & Cron**: Vercel Serverless Functions + Vercel Cron Jobs.
- **APIs**:
  - Weather Data: QWeather (和风天气) API.
  - Notifications: Server酱 (Turbo version).

## 3. Data Flow & Core Logic

### 3.1 Frontend (H5 App)
- **Geolocation**: Upon opening, requests browser `navigator.geolocation`. Converts coordinates to a QWeather `Location ID`. Fallback to manual city search.
- **Dashboard**: Displays today's weather, any active official disaster warnings, and a 7-day temperature trend chart (using a lightweight charting library like Recharts).
- **Subscription Management**: Users input their Server酱 `SendKey` to subscribe.
  - **Identity**: A client-generated UUID stored in `localStorage` serves as the `UserID`.
  - **Actions**: The frontend calls APIs to Upsert (create or update) and Delete (unsubscribe) the subscription record (`[UserID, SendKey, LocationId, CityName]`) in Vercel KV.

### 3.2 Backend & Storage (Vercel KV & APIs)
- **KV Storage**: A Hash or List in Vercel KV storing subscriber profiles. It supports upsert and delete operations based on `UserID`.
- **Manual Push / Target Control Interface**:
  - An API endpoint (`/api/push/target`) reserved to push notifications to specific users manually. This allows granular control over pushing to specific individuals outside of the automated cron. This endpoint will be protected by an environment variable API key to prevent unauthorized access.

### 3.3 Cron Job Logic (The Notification Engine)
- **Trigger**: Runs twice daily (e.g., 07:00 and 20:00) via Vercel Cron.
- **Execution Steps**:
  1. Fetch all subscribers from Vercel KV.
  2. Group subscribers by `LocationId` to minimize redundant QWeather API calls.
  3. For each location, fetch weather data and disaster warnings.
  4. Evaluate conditions:
     - **Disaster Warning**: Any active official alerts (e.g., Yellow rainstorm).
     - **Sudden Change**: Tomorrow's high/low temperature drops by 8°C or more compared to today's, or clear skies transition to heavy rain/snow.
  5. If conditions are met, iterate through affected subscribers and dispatch HTTP POST requests to Server酱 using their `SendKey`.

## 4. Development Directory
All development must occur within the `weather-h5` directory in the current workspace.