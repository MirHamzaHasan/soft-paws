import type { Router } from 'expo-router';

import type { PremiumFeatureKey } from './premiumAccess';

export function openPremiumGate(router: Router, feature: PremiumFeatureKey) {
  router.push({
    pathname: '/premium-gate',
    params: { feature },
  });
}
