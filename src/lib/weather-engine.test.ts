import { describe, it, expect } from 'vitest';
import { evaluateWeatherCondition } from '@/lib/weather-engine';

describe('Weather Engine', () => {
  it('should trigger on sudden temperature drop', () => {
    const daily = [
      { tempMax: '20', tempMin: '10', textDay: '晴' },
      { tempMax: '10', tempMin: '2', textDay: '晴' }
    ];
    const result = evaluateWeatherCondition(daily, []);
    expect(result.shouldNotify).toBe(true);
    expect(result.message).toContain('温度骤降');
  });

  it('should trigger on sudden temperature rise', () => {
    const daily = [
      { tempMax: '20', tempMin: '10', textDay: '晴' },
      { tempMax: '30', tempMin: '15', textDay: '晴' }
    ];
    const result = evaluateWeatherCondition(daily, []);
    expect(result.shouldNotify).toBe(true);
    expect(result.message).toContain('气温回升');
  });

  it('should trigger on rain tomorrow when it is clear today', () => {
    const daily = [
      { tempMax: '20', tempMin: '10', textDay: '晴' },
      { tempMax: '18', tempMin: '12', textDay: '小雨' }
    ];
    const result = evaluateWeatherCondition(daily, []);
    expect(result.shouldNotify).toBe(true);
    expect(result.message).toContain('降水');
  });

  it('should trigger on weather warnings', () => {
    const daily = [
      { tempMax: '20', tempMin: '10', textDay: '晴' },
      { tempMax: '18', tempMin: '12', textDay: '晴' }
    ];
    const warnings = [{ title: '大风黄色预警' }];
    const result = evaluateWeatherCondition(daily, warnings);
    expect(result.shouldNotify).toBe(true);
    expect(result.message).toContain('气象预警: 大风黄色预警');
  });

  it('should NOT trigger when weather is stable', () => {
    const daily = [
      { tempMax: '20', tempMin: '10', textDay: '晴' },
      { tempMax: '19', tempMin: '9', textDay: '多云' }
    ];
    const result = evaluateWeatherCondition(daily, []);
    expect(result.shouldNotify).toBe(false);
  });
});
