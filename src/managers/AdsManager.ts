const noopSubscription = {
  remove: () => undefined,
};

const AdsManager = {
  initialize: async (_sdkKey: string): Promise<void> => {},

  setHasUserConsent: (_hasConsent: boolean) => {},

  setDoNotSell: (_doNotSell: boolean) => {},

  loadInterstitial: (_adUnitId: string) => {},

  showInterstitial: async (_adUnitId: string): Promise<void> => {},

  loadRewardedAd: (_adUnitId: string) => {},

  showRewardedAd: async (_adUnitId: string): Promise<void> => {},

  addAdFailedToDisplayEventListener(
    _adUnitId: string,
    _callback: (adInfo: Record<string, unknown>) => void,
  ) {
    return noopSubscription;
  },

  addAdHiddenEventListener(
    _adUnitId: string,
    _callback: (adInfo: Record<string, unknown>) => void,
  ) {
    return noopSubscription;
  },

  addRewardedAdReceivedRewardEventListener(
    _adUnitId: string,
    _callback: (adInfo: Record<string, unknown>) => void,
  ) {
    return noopSubscription;
  },
};

export default AdsManager;
