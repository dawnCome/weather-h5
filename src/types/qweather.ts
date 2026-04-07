export interface QWeatherResponse {
  code: string;
  updateTime?: string;
  fxLink?: string;
}

export interface CityLookupResponse extends QWeatherResponse {
  location: Array<{
    name: string;
    id: string;
    lat: string;
    lon: string;
    adm2: string;
    adm1: string;
    country: string;
    tz: string;
    utcOffset: string;
    isDst: string;
    type: string;
    rank: string;
    fxLink: string;
  }>;
}

export interface DailyWeather {
  fxDate: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  moonPhaseIcon: string;
  tempMax: string;
  tempMin: string;
  iconDay: string;
  textDay: string;
  iconNight: string;
  textNight: string;
  wind360Day: string;
  windDirDay: string;
  windScaleDay: string;
  windSpeedDay: string;
  wind360Night: string;
  windDirNight: string;
  windScaleNight: string;
  windSpeedNight: string;
  humidity: string;
  precip: string;
  pressure: string;
  vis: string;
  cloud: string;
  uvIndex: string;
}

export interface Weather7DResponse extends QWeatherResponse {
  daily: DailyWeather[];
}

export interface WeatherWarning {
  id: string;
  sender: string;
  pubTime: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  level: string;
  type: string;
  typeName: string;
  text: string;
  related: string;
}

export interface WarningResponse extends QWeatherResponse {
  warning: WeatherWarning[];
}

export interface CityInfo {
  id: string;
  name: string;
}

export interface WeatherResponse {
  city: string;
  daily: DailyWeather[];
  warning: WeatherWarning[];
  updateTime: string;
}
