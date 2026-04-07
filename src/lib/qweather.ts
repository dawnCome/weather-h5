import {
  CityLookupResponse,
  Weather7DResponse,
  WarningResponse,
  CityInfo,
  QWeatherResponse
} from '@/types/qweather';

const GEO_URL = 'https://geoapi.qweather.com/v2';
const BASE_URL = 'https://api.qweather.com/v7';

function getApiKey() {
  const key = process.env.QWEATHER_KEY;
  if (!key) {
    throw new Error('Missing QWEATHER_KEY in environment variables');
  }
  return key;
}

async function request<T extends QWeatherResponse>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Weather API request failed with status: ${res.status} for ${url}`);
  }

  const data = await res.json() as T;

  // Handle QWeather business error codes
  // 200: success, 204: no data (not an error in some cases), 400+: errors
  if (data.code !== '200' && data.code !== '204') {
    throw new Error(`Weather API returned error code: ${data.code} for ${url}`);
  }

  return data;
}

export async function getCityId(location: string): Promise<CityInfo | null> {
  const key = getApiKey();
  const params = new URLSearchParams({ location, key });
  const data = await request<CityLookupResponse>(
    `${GEO_URL}/city/lookup?${params.toString()}`
  );

  if (!data.location || data.location.length === 0) return null;
  return { id: data.location[0].id, name: data.location[0].name };
}

export async function getWeather7D(locationId: string): Promise<Weather7DResponse> {
  const key = getApiKey();
  const params = new URLSearchParams({ location: locationId, key });
  return request<Weather7DResponse>(
    `${BASE_URL}/weather/7d?${params.toString()}`
  );
}

export async function getWarnings(locationId: string): Promise<WarningResponse> {
  const key = getApiKey();
  const params = new URLSearchParams({ location: locationId, key });
  return request<WarningResponse>(
    `${BASE_URL}/warning/now?${params.toString()}`
  );
}
