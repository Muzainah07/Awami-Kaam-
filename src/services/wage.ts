import { SkillType, WageEstimate } from '../types';
import { SKILL_WAGE_BENCHMARKS } from '../data/seed';

export function calculateLocalFairWage(
  skill: SkillType,
  area: string,
  city: string,
  jobSize: string,
  urgency: 'normal' | 'urgent' | 'emergency',
  offeredRatePkr?: number
): WageEstimate {
  const benchmark = SKILL_WAGE_BENCHMARKS[skill] || SKILL_WAGE_BENCHMARKS.laborer;
  
  let multiplier = 1.0;

  // City adjustments
  if (city.toLowerCase() === 'islamabad') multiplier *= 1.15;
  else if (city.toLowerCase() === 'karachi' || city.toLowerCase() === 'lahore') multiplier *= 1.05;

  // Urgency adjustments
  if (urgency === 'urgent') multiplier *= 1.15;
  if (urgency === 'emergency') multiplier *= 1.25;

  // Job size heuristics
  const jobLower = jobSize.toLowerCase();
  if (jobLower.includes('room') && (jobLower.includes('3') || jobLower.includes('4') || jobLower.includes('full'))) {
    multiplier *= 1.2;
  }

  const min_rate_pkr = Math.round((benchmark.min * multiplier) / 100) * 100;
  const max_rate_pkr = Math.round((benchmark.max * multiplier) / 100) * 100;
  const recommended_pkr = Math.round((benchmark.avg * multiplier) / 100) * 100;
  const market_average_pkr = recommended_pkr;

  const offered = offeredRatePkr || recommended_pkr;
  const is_fair = offered >= min_rate_pkr * 0.9;
  const diff = Math.round(((offered - recommended_pkr) / recommended_pkr) * 100);

  let reason = `Based on current 2026 Karachi market standards for ${benchmark.labelEn}.`;
  if (urgency !== 'normal') {
    reason += ` Includes +${urgency === 'emergency' ? '25%' : '15%'} rush allowance.`;
  }

  let warningUr = `یہ ریٹ منصفانہ ہے (مارکیٹ ریٹ: ${min_rate_pkr.toLocaleString()} سے ${max_rate_pkr.toLocaleString()} روپے)۔`;
  let warningEn = `This rate is fair (Market range: PKR ${min_rate_pkr.toLocaleString()} - ${max_rate_pkr.toLocaleString()}).`;

  if (!is_fair) {
    warningUr = `خبردار! یہ پیشکش مارکیٹ ریٹ سے کم ہے۔ مارکیٹ ریٹ ${min_rate_pkr.toLocaleString()} سے ${max_rate_pkr.toLocaleString()} روپے ہے۔`;
    warningEn = `Warning: This offer is below fair market rate. Expected range is PKR ${min_rate_pkr.toLocaleString()} - ${max_rate_pkr.toLocaleString()}.`;
  }

  return {
    skill,
    city,
    area,
    min_rate_pkr,
    max_rate_pkr,
    recommended_pkr,
    market_average_pkr,
    is_fair,
    difference_percentage: diff,
    reason,
    worker_voice_warning_ur: warningUr,
    worker_voice_warning_en: warningEn,
  };
}

export async function fetchAIFairWage(params: {
  skill: SkillType;
  area: string;
  city: string;
  jobSize: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  offeredRatePkr?: number;
}): Promise<WageEstimate> {
  try {
    const res = await fetch('/api/gemini/fair-wage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to query AI fair wage');
    const data = await res.json();
    return data;
  } catch {
    return calculateLocalFairWage(
      params.skill,
      params.area,
      params.city,
      params.jobSize,
      params.urgency,
      params.offeredRatePkr
    );
  }
}
