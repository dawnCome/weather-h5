import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { getCityId, getWeather7D, getWarnings } from './qweather'

const handlers = [
  http.get('https://geoapi.qweather.com/v2/city/lookup', ({ request }) => {
    const url = new URL(request.url)
    const location = url.searchParams.get('location')
    if (location === '北京') {
      return HttpResponse.json({
        code: '200',
        location: [{ name: '北京', id: '101010100', lat: '39.90498', lon: '116.40528' }]
      })
    }
    return HttpResponse.json({ code: '204', location: [] })
  }),

  http.get('https://api.qweather.com/v7/weather/7d', () => {
    return HttpResponse.json({
      code: '200',
      daily: [
        { fxDate: '2024-03-20', tempMax: '15', tempMin: '5', textDay: '晴' }
      ]
    })
  }),

  http.get('https://api.qweather.com/v7/warning/now', () => {
    return HttpResponse.json({
      code: '200',
      warning: [
        { title: '大风预警' }
      ]
    })
  })
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('QWeather API', () => {
  it('should get city id and name', async () => {
    const city = await getCityId('北京')
    expect(city).toEqual({ id: '101010100', name: '北京' })
  })

  it('should return null for non-existent city', async () => {
    const city = await getCityId('不存在的城市')
    expect(city).toBeNull()
  })

  it('should get 7 days weather', async () => {
    const data = await getWeather7D('101010100')
    expect(data.code).toBe('200')
    expect(data.daily).toHaveLength(1)
    expect(data.daily[0].textDay).toBe('晴')
  })

  it('should get weather warnings', async () => {
    const data = await getWarnings('101010100')
    expect(data.code).toBe('200')
    expect(data.warning).toHaveLength(1)
    expect(data.warning[0].title).toBe('大风预警')
  })
})
