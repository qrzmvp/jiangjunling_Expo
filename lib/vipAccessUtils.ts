import { User } from '@supabase/supabase-js';
import { UserProfile } from '../contexts/AuthContext';

export type MetricsAccessReason = 'login_required' | 'free_expired';

const DAY_MS = 24 * 60 * 60 * 1000;
const FREE_TRIAL_DAYS = 7;

const getTrialEndTime = (createdAt?: string | null): number | null => {
  if (!createdAt) return null;
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return null;
  return createdTime + FREE_TRIAL_DAYS * DAY_MS;
};

export const getMetricsAccessState = (user: User | null, profile: UserProfile | null) => {
  if (!user) {
    return {
      canViewMetrics: false,
      reason: 'login_required' as MetricsAccessReason,
      isFreeTrialActive: false,
      remainingDays: null as number | null,
    };
  }

  const vipStatus = profile?.vip_status;
  if (vipStatus && vipStatus !== 'free') {
    return {
      canViewMetrics: true,
      reason: null as MetricsAccessReason | null,
      isFreeTrialActive: false,
      remainingDays: null as number | null,
    };
  }

  const trialEnd = getTrialEndTime(profile?.created_at || null);
  if (!trialEnd) {
    return {
      canViewMetrics: false,
      reason: 'free_expired' as MetricsAccessReason,
      isFreeTrialActive: false,
      remainingDays: 0,
    };
  }

  const now = Date.now();
  const remainingMs = trialEnd - now;
  if (remainingMs >= 0) {
    const remainingDays = Math.round(remainingMs / DAY_MS);
    return {
      canViewMetrics: true,
      reason: null as MetricsAccessReason | null,
      isFreeTrialActive: true,
      remainingDays,
    };
  }

  return {
    canViewMetrics: false,
    reason: 'free_expired' as MetricsAccessReason,
    isFreeTrialActive: false,
    remainingDays: 0,
  };
};
