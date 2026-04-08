import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { getCityId, getWeather7D, getWarnings } from './qweather'

const handlers = [
  http.get('https://geoapi.qweather.com/v2/city/lookup', ({ request }) => {
    const url = new URL(request.url)
    const location = url.searchParams.get('location')
    const key = url.searchParams.get('key')

    if (!key) {
      return HttpResponse.json({ code: '401' })
    }

    if (location === '北京') {
      return HttpResponse.json({
        code: '200',
        location: [{ name: '北京', id: '101010100', lat: '39.90498', lon: '116.40528' }]
      })
    }

    if (location === 'error') {
      return HttpResponse.json({ code: '500' })
    }

    return HttpResponse.json({ code: '204', location: [] })
  }),

  http.get('https://api.qweather.com/v7/weather/7d', ({ request }) => {
    const url = new URL(request.url)
    const location = url.searchParams.get('location')
    if (location === 'invalid') {
      return HttpResponse.json({ code: '400' })
    }
    return HttpResponse.json({
      code: '200',
      daily: [
        { fxDate: '2024-03-20', tempMax: '15', tempMin: '5', textDay: '晴' }
      ]
    })
  }),

  http.get('https://api.qweather.com/v7/warning/now', ({ request }) => {
    const url = new URL(request.url)
    const location = url.searchParams.get('location')
    if (location === 'network-error') {
      return HttpResponse.error()
    }
    return HttpResponse.json({
      code: '200',
      warning: [
        { title: '大风预警' }
      ]
    })
  })
]

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  vi.stubEnv('QWEATHER_KEY', 'test-key')
})
afterEach(() => {
  server.resetHandlers()
  vi.unstubAllEnvs()
})
afterAll(() => {
  server.close()
})

describe('QWeather API', () => {
  describe('Success Paths', () => {
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

  describe('Error Paths', () => {
    it('should throw error when QWEATHER_KEY is missing', async () => {
      vi.stubEnv('QWEATHER_KEY', '')
      await expect(getCityId('北京')).rejects.toThrow('Missing QWEATHER_KEY')
    })

    it('should throw error when API returns non-200 code', async () => {
      await expect(getCityId('error')).rejects.toThrow('Weather API returned error code: 500')
    })

    it('should throw error when API request fails (HTTP error)', async () => {
      server.use(
        http.get('https://geoapi.qweather.com/v2/city/lookup', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )
      await expect(getCityId('北京')).rejects.toThrow('Weather API request failed with status: 500')
    })

    it('should throw error on network failure', async () => {
      await expect(getWarnings('network-error')).rejects.toThrow()
    })

    it('should throw error for invalid location ID', async () => {
      await expect(getWeather7D('invalid')).rejects.toThrow('Weather API returned error code: 400')
    })
  })
})
