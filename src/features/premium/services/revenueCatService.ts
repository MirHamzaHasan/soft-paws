import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

import { type BarklogUserRow, getSupabaseClient } from '@/api';
import { readClientEnv } from '@/utils/clientEnv';

import {
  BARKLOG_PREMIUM_PLANS,
  type BarklogPremiumPlan,
  type BarklogPremiumPlanId,
  REVENUECAT_ENTITLEMENT_ID,
} from '../data/premiumCatalog';

type RevenueCatConfiguration = {
  apiKey: string | null;
  configured: boolean;
  platform: typeof Platform.OS;
  reason?: string;
};

type RevenueCatAdapter = {
  configure: (configuration: { apiKey: string; appUserID: string }) => void;
  getCustomerInfo: () => Promise<CustomerInfo>;
  getOfferings: () => Promise<PurchasesOfferings>;
  purchasePackage: (
    revenueCatPackage: PurchasesPackage,
  ) => Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases: () => Promise<CustomerInfo>;
};

export type BarklogRevenueCatEntitlement = {
  active: boolean;
  entitlementId: typeof REVENUECAT_ENTITLEMENT_ID;
  expirationDate: string | null;
  productIdentifier: string | null;
  willRenew: boolean | null;
};

export type BarklogRevenueCatOfferings = {
  configuration: RevenueCatConfiguration;
  entitlementId: typeof REVENUECAT_ENTITLEMENT_ID;
  plans: BarklogPremiumPlan[];
  revenueCatOfferings: PurchasesOfferings | null;
};

export type BarklogPurchaseResult = {
  entitlement: BarklogRevenueCatEntitlement;
  plan: BarklogPremiumPlan;
  user: BarklogUserRow;
};

export type BarklogRestoreResult =
  | {
      entitlement: BarklogRevenueCatEntitlement;
      restored: true;
      user: BarklogUserRow;
    }
  | {
      entitlement: BarklogRevenueCatEntitlement | null;
      message: string;
      restored: false;
      user?: BarklogUserRow;
    };

const revenueCatAdapter: RevenueCatAdapter = {
  configure: (configuration) => {
    Purchases.configure(configuration);
  },
  getCustomerInfo: () => Purchases.getCustomerInfo(),
  getOfferings: () => Purchases.getOfferings(),
  purchasePackage: (revenueCatPackage) =>
    Purchases.purchasePackage(revenueCatPackage),
  restorePurchases: () => Purchases.restorePurchases(),
};

let adapterOverride: RevenueCatAdapter | null = null;
let configuredIdentity: string | null = null;

function getAdapter() {
  return adapterOverride ?? revenueCatAdapter;
}

export function setRevenueCatAdapterForTests(
  adapter: RevenueCatAdapter | null,
) {
  adapterOverride = adapter;
  configuredIdentity = null;
}

export function getRevenueCatConfiguration(): RevenueCatConfiguration {
  const env = readClientEnv();

  if (!env.ok) {
    return {
      apiKey: null,
      configured: false,
      platform: Platform.OS,
      reason: env.issues.join('; '),
    };
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return {
      apiKey: null,
      configured: false,
      platform: Platform.OS,
      reason:
        'RevenueCat purchases are available in native iOS and Android builds.',
    };
  }

  const apiKey =
    Platform.OS === 'ios'
      ? env.value.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : env.value.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

  return {
    apiKey: apiKey ?? null,
    configured: Boolean(apiKey),
    platform: Platform.OS,
    reason: apiKey
      ? undefined
      : `Missing ${Platform.OS === 'ios' ? 'iOS' : 'Android'} RevenueCat public key.`,
  };
}

function assertRevenueCatConfigured(userId: string) {
  const configuration = getRevenueCatConfiguration();

  if (!configuration.configured || !configuration.apiKey) {
    throw new Error(
      configuration.reason ??
        'RevenueCat is not configured for this BarkLog build.',
    );
  }

  if (configuredIdentity !== userId) {
    getAdapter().configure({
      apiKey: configuration.apiKey,
      appUserID: userId,
    });
    configuredIdentity = userId;
  }

  return configuration;
}

function listRevenueCatPackages(offerings: PurchasesOfferings) {
  const allPackages = Object.values(offerings.all).flatMap(
    (offering) => offering.availablePackages,
  );
  const currentPackages = offerings.current?.availablePackages ?? [];
  const seenPackageKeys = new Set<string>();

  return [...currentPackages, ...allPackages].filter((revenueCatPackage) => {
    const key = `${revenueCatPackage.offeringIdentifier}:${revenueCatPackage.identifier}:${revenueCatPackage.product.identifier}`;

    if (seenPackageKeys.has(key)) {
      return false;
    }

    seenPackageKeys.add(key);
    return true;
  });
}

function findRevenueCatPackageForPlan(input: {
  offerings: PurchasesOfferings;
  plan: BarklogPremiumPlan;
}) {
  const preferredPackage =
    input.plan.id === 'annual'
      ? input.offerings.current?.annual
      : input.offerings.current?.monthly;

  if (preferredPackage?.product.identifier === input.plan.productId) {
    return preferredPackage;
  }

  return listRevenueCatPackages(input.offerings).find(
    (revenueCatPackage) =>
      revenueCatPackage.product.identifier === input.plan.productId,
  );
}

function getCancelSafePurchaseError(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const maybeRecord = error as {
      code?: unknown;
      message?: unknown;
      userCancelled?: unknown;
    };

    if (
      maybeRecord.userCancelled === true ||
      String(maybeRecord.code ?? '')
        .toLowerCase()
        .includes('cancel') ||
      String(maybeRecord.message ?? '')
        .toLowerCase()
        .includes('cancel')
    ) {
      return new Error('Purchase cancelled. Premium was not activated.');
    }
  }

  return error instanceof Error
    ? error
    : new Error('Unable to complete the purchase right now.');
}

export function readBarklogPremiumEntitlement(
  customerInfo: CustomerInfo,
): BarklogRevenueCatEntitlement {
  const entitlement =
    customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID] ??
    customerInfo.entitlements.all[REVENUECAT_ENTITLEMENT_ID] ??
    null;

  return {
    active: Boolean(entitlement?.isActive),
    entitlementId: REVENUECAT_ENTITLEMENT_ID,
    expirationDate: entitlement?.expirationDate ?? null,
    productIdentifier: entitlement?.productIdentifier ?? null,
    willRenew: entitlement?.willRenew ?? null,
  };
}

async function updateUserSubscriptionState(input: {
  revenueCatUserId: string;
  subscriptionTier: BarklogUserRow['subscription_tier'];
  userId: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update({
      revenuecat_user_id: input.revenueCatUserId,
      subscription_tier: input.subscriptionTier,
    })
    .eq('id', input.userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function cacheVerifiedRevenueCatUser(input: {
  customerInfo: CustomerInfo;
  subscriptionTier: BarklogUserRow['subscription_tier'];
  userId: string;
}) {
  return updateUserSubscriptionState({
    revenueCatUserId: input.customerInfo.originalAppUserId || input.userId,
    subscriptionTier: input.subscriptionTier,
    userId: input.userId,
  });
}

export async function getRevenueCatOfferings(input?: {
  userId?: string;
}): Promise<BarklogRevenueCatOfferings> {
  const configuration = input?.userId
    ? assertRevenueCatConfigured(input.userId)
    : getRevenueCatConfiguration();
  const canReadRevenueCatOfferings = Boolean(
    input?.userId && configuration.configured,
  );

  return {
    configuration,
    entitlementId: REVENUECAT_ENTITLEMENT_ID,
    plans: Object.values(BARKLOG_PREMIUM_PLANS),
    revenueCatOfferings: canReadRevenueCatOfferings
      ? await getAdapter().getOfferings()
      : null,
  };
}

export async function purchaseBarklogPlan(input: {
  planId: BarklogPremiumPlanId;
  userId: string;
}): Promise<BarklogPurchaseResult> {
  const plan = BARKLOG_PREMIUM_PLANS[input.planId];

  if (!plan) {
    throw new Error('Unknown BarkLog premium plan.');
  }

  assertRevenueCatConfigured(input.userId);

  const offerings = await getAdapter().getOfferings();
  const revenueCatPackage = findRevenueCatPackageForPlan({
    offerings,
    plan,
  });

  if (!revenueCatPackage) {
    throw new Error(
      `RevenueCat offering is missing the ${plan.productId} product.`,
    );
  }

  let customerInfo: CustomerInfo;

  try {
    customerInfo = (await getAdapter().purchasePackage(revenueCatPackage))
      .customerInfo;
  } catch (purchaseError) {
    throw getCancelSafePurchaseError(purchaseError);
  }

  const entitlement = readBarklogPremiumEntitlement(customerInfo);

  if (!entitlement.active) {
    throw new Error(
      'Purchase completed, but RevenueCat did not return an active BarkLog Premium entitlement.',
    );
  }

  const user = await cacheVerifiedRevenueCatUser({
    customerInfo,
    subscriptionTier: 'active',
    userId: input.userId,
  });

  return {
    entitlement,
    plan,
    user,
  };
}

export async function restoreBarklogPurchases(input: {
  user: BarklogUserRow;
}): Promise<BarklogRestoreResult> {
  assertRevenueCatConfigured(input.user.id);

  const customerInfo = await getAdapter().restorePurchases();
  const entitlement = readBarklogPremiumEntitlement(customerInfo);

  if (entitlement.active) {
    const user = await cacheVerifiedRevenueCatUser({
      customerInfo,
      subscriptionTier: 'active',
      userId: input.user.id,
    });

    return {
      entitlement,
      restored: true,
      user,
    };
  }

  if (input.user.subscription_tier === 'active') {
    const user = await cacheVerifiedRevenueCatUser({
      customerInfo,
      subscriptionTier: 'expired',
      userId: input.user.id,
    });

    return {
      entitlement,
      message:
        'No active BarkLog Premium entitlement was found for this account.',
      restored: false,
      user,
    };
  }

  return {
    entitlement,
    message:
      'No active BarkLog Premium entitlement was found for this account.',
    restored: false,
  };
}

export async function openSubscriptionManagement() {
  const url =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';

  await Linking.openURL(url);
}
