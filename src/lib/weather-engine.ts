/**
 * 评估天气状况是否需要通知
 * @param daily 7天天气预报数组
 * @param warnings 当前气象预警数组
 * @returns 是否通知及通知内容
 */
export function evaluateWeatherCondition(daily: any[], warnings: any[]) {
  // 1. 优先处理气象预警
  if (warnings && warnings.length > 0) {
    return {
      shouldNotify: true,
      message: `气象预警: ${warnings[0].title}`
    };
  }

  // 2. 比较今明两天的天气变化
  if (daily.length >= 2) {
    const today = daily[0];
    const tomorrow = daily[1];

    const tempMaxToday = parseInt(today.tempMax);
    const tempMaxTomorrow = parseInt(tomorrow.tempMax);
    const tempMinToday = parseInt(today.tempMin);
    const tempMinTomorrow = parseInt(tomorrow.tempMin);

    const maxDiff = tempMaxTomorrow - tempMaxToday;
    const minDiff = tempMinTomorrow - tempMinToday;

    // 温度骤降 (>= 8度)
    if (maxDiff <= -8 || minDiff <= -8) {
      return {
        shouldNotify: true,
        message: `温度骤降提醒！明天温度将大幅下降，请注意保暖。`
      };
    }

    // 气温回升 (>= 8度)
    if (maxDiff >= 8 || minDiff >= 8) {
      return {
        shouldNotify: true,
        message: `气温回升提醒！明天天气转暖，建议适时减衣。`
      };
    }

    // 降水提醒 (今天无雨雪，明天有雨雪)
    const rainTexts = ['雨', '雪'];
    const todayHasRain = rainTexts.some(text => today.textDay.includes(text));
    const tomorrowHasRain = rainTexts.some(text => tomorrow.textDay.includes(text));

    if (!todayHasRain && tomorrowHasRain) {
      return {
        shouldNotify: true,
        message: `变天提醒！明天有降水（${tomorrow.textDay}），出门请记得带伞。`
      };
    }
  }

  return { shouldNotify: false, message: '' };
}
