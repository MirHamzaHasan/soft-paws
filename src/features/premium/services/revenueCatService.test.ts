import type {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';

import {
  BARKLOG_PREMIUM_PLANS,
  REVENUECAT_ENTITLEMENT_ID,
} from '@/features/premium/data/premiumCatalog';
import {
  purchaseBarklogPlan,
  readBarklogPremiumEntitlement,
  restoreBarklogPurchases,
  setRevenueCatAdapterForTests,
} from '@/features/premium/services/revenueCatService';

import { makeUserRow } from '../../../../test/utils/builders';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

const mockReadClientEnv = jest.fn();

jest.mock('@/utils/clientEnv', () => ({
  readClientEnv: () => mockReadClientEnv(),
}));

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({
  single: mockSingle,
}));
const mockEq = jest.fn(() => ({
  select: mockSelect,
}));
const mockUpdate = jest.fn(() => ({
  eq: mockEq,
}));
const mockFrom = jest.fn(() => ({
  update: mockUpdate,
}));

jest.mock('@/api', () => ({
  getSupabaseClient: () => ({
    from: mockFrom,
  }),
}));

function makeCustomerInfo(input: {
  active: boolean;
  originalAppUserId?: string;
  productIdentifier?: string;
}): CustomerInfo {
  const entitlement = {
    expirationDate: input.active ? '2026-05-26T00:00:00.000Z' : null,
    identifier: REVENUECAT_ENTITLEMENT_ID,
    isActive: input.active,
    productIdentifier: input.productIdentifier ?? 'barklog_annual',
    willRenew: input.active,
  };

  return {
    activeSubscriptions: input.active ? [entitlement.productIdentifier] : [],
    allExpirationDates: {},
    allPurchaseDates: {},
    allPurchasedProductIdentifiers: [entitlement.productIdentifier],
    entitlements: {
      active: input.active
        ? {
            [REVENUECAT_ENTITLEMENT_ID]: entitlement,
          }
        : {},
      all: {
        [REVENUECAT_ENTITLEMENT_ID]: entitlement,
      },
      verification: 'NOT_REQUESTED',
    },
    firstSeen: '2026-04-26T00:00:00.000Z',
    latestExpirationDate: entitlement.expirationDate,
    managementURL: null,
    nonSubscriptionTransactions: [],
    originalApplicationVersion: null,
    originalAppUserId: input.originalAppUserId ?? 'revenuecat-user-1',
    originalPurchaseDate: null,
    requestDate: '2026-04-26T00:00:00.000Z',
    subscriptionsByProductIdentifier: {},
  } as unknown as CustomerInfo;
}

function makePackage(productIdentifier: string): PurchasesPackage {
  return {
    identifier:
      productIdentifier === BARKLOG_PREMIUM_PLANS.annual.productId
        ? '$rc_annual'
        : '$rc_monthly',
    offeringIdentifier: 'default',
    product: {
      identifier: productIdentifier,
    },
  } as unknown as PurchasesPackage;
}

function makeOfferings(): PurchasesOfferings {
  const annualPackage = makePackage(BARKLOG_PREMIUM_PLANS.annual.productId);
  const monthlyPackage = makePackage(BARKLOG_PREMIUM_PLANS.monthly.productId);
  const current = {
    annual: annualPackage,
    availablePackages: [annualPackage, monthlyPackage],
    monthly: monthlyPackage,
  };

  return {
    all: {
      default: current,
    },
    current,
  } as unknown as PurchasesOfferings;
}

function makeAdapter(overrides = {}) {
  return {
    configure: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(async () => makeOfferings()),
    purchasePackage: jest.fn(async () => ({
      customerInfo: makeCustomerInfo({
        active: true,
      }),
    })),
    restorePurchases: jest.fn(async () =>
      makeCustomerInfo({
        active: true,
      }),
    ),
    ...overrides,
  };
}

describe('RevenueCat premium service', () => {
  beforeEach(() => {
    mockReadClientEnv.mockReturnValue({
      ok: true,
      value: {
        EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'goog_test_key',
        EXPO_PUBLIC_REVENUECAT_IOS_KEY: 'appl_test_key',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      },
    });
    setRevenueCatAdapterForTests(null);
    jest.clearAllMocks();
  });

  afterEach(() => {
    setRevenueCatAdapterForTests(null);
  });

  it('reads the active RevenueCat premium entitlement', () => {
    expect(
      readBarklogPremiumEntitlement(
        makeCustomerInfo({
          active: true,
          productIdentifier: 'barklog_monthly',
        }),
      ),
    ).toEqual({
      active: true,
      entitlementId: REVENUECAT_ENTITLEMENT_ID,
      expirationDate: '2026-05-26T00:00:00.000Z',
      productIdentifier: 'barklog_monthly',
      willRenew: true,
    });
  });

  it('activates premium only after purchase returns an active entitlement', async () => {
    const updatedUser = makeUserRow({
      revenuecat_user_id: 'revenuecat-user-1',
      subscription_tier: 'active',
    });
    const adapter = makeAdapter();
    mockSingle.mockResolvedValue({
      data: updatedUser,
      error: null,
    });
    setRevenueCatAdapterForTests(adapter);

    await expect(
      purchaseBarklogPlan({
        planId: 'annual',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      entitlement: {
        active: true,
      },
      plan: BARKLOG_PREMIUM_PLANS.annual,
      user: updatedUser,
    });

    expect(adapter.configure).toHaveBeenCalledWith({
      apiKey: 'appl_test_key',
      appUserID: 'user-1',
    });
    expect(adapter.purchasePackage).toHaveBeenCalledWith(
      expect.objectContaining({
        product: expect.objectContaining({
          identifier: 'barklog_annual',
        }),
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith({
      revenuecat_user_id: 'revenuecat-user-1',
      subscription_tier: 'active',
    });
  });

  it('does not unlock premium when RevenueCat purchase is cancelled', async () => {
    const adapter = makeAdapter({
      purchasePackage: jest.fn(async () => {
        throw Object.assign(new Error('Purchase cancelled'), {
          code: 'PURCHASE_CANCELLED_ERROR',
          userCancelled: true,
        });
      }),
    });
    setRevenueCatAdapterForTests(adapter);

    await expect(
      purchaseBarklogPlan({
        planId: 'monthly',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Purchase cancelled. Premium was not activated.');

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('does not unlock premium when purchase lacks the premium entitlement', async () => {
    const adapter = makeAdapter({
      purchasePackage: jest.fn(async () => ({
        customerInfo: makeCustomerInfo({
          active: false,
        }),
      })),
    });
    setRevenueCatAdapterForTests(adapter);

    await expect(
      purchaseBarklogPlan({
        planId: 'annual',
        userId: 'user-1',
      }),
    ).rejects.toThrow('RevenueCat did not return an active BarkLog Premium');

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('restores active entitlements and caches the verified user state', async () => {
    const updatedUser = makeUserRow({
      revenuecat_user_id: 'revenuecat-user-1',
      subscription_tier: 'active',
    });
    const adapter = makeAdapter();
    mockSingle.mockResolvedValue({
      data: updatedUser,
      error: null,
    });
    setRevenueCatAdapterForTests(adapter);

    await expect(
      restoreBarklogPurchases({
        user: makeUserRow({
          subscription_tier: 'expired',
        }),
      }),
    ).resolves.toMatchObject({
      restored: true,
      user: updatedUser,
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      revenuecat_user_id: 'revenuecat-user-1',
      subscription_tier: 'active',
    });
  });

  it('downgrades stale active cache when restore returns no entitlement', async () => {
    const expiredUser = makeUserRow({
      revenuecat_user_id: 'revenuecat-user-1',
      subscription_tier: 'expired',
    });
    const adapter = makeAdapter({
      restorePurchases: jest.fn(async () =>
        makeCustomerInfo({
          active: false,
        }),
      ),
    });
    mockSingle.mockResolvedValue({
      data: expiredUser,
      error: null,
    });
    setRevenueCatAdapterForTests(adapter);

    await expect(
      restoreBarklogPurchases({
        user: makeUserRow({
          subscription_tier: 'active',
        }),
      }),
    ).resolves.toMatchObject({
      message:
        'No active BarkLog Premium entitlement was found for this account.',
      restored: false,
      user: expiredUser,
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      revenuecat_user_id: 'revenuecat-user-1',
      subscription_tier: 'expired',
    });
  });
});
