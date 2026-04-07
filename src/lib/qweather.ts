export async function getCityId(location: string) {
  const key = process.env.QWEATHER_KEY;
  const res = await fetch(`https://geoapi.qweather.com/v2/city/lookup?location=${location}&key=${key}`);
  const data = await res.json();
  if (!data.location || data.location.length === 0) return null;
  return { id: data.location[0].id, name: data.location[0].name };
}

export async function getWeather7D(locationId: string) {
  const key = process.env.QWEATHER_KEY;
  const res = await fetch(`https://api.qweather.com/v7/weather/7d?location=${locationId}&key=${key}`);
  return res.json();
}

export async function getWarnings(locationId: string) {
  const key = process.env.QWEATHER_KEY;
  const res = await fetch(`https://api.qweather.com/v7/warning/now?location=${locationId}&key=${key}`);
  return res.json();
}
