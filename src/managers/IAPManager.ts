type Product = {
  id: string;
};

type Purchase = {
  productId: string;
};

const IAPManager = {
  initialize: async (): Promise<void> => {},

  getProducts: async (_skus: string[]): Promise<Product[]> => [],

  requestPurchase: async (
    _sku: string,
  ): Promise<Purchase | Purchase[] | null> => null,

  finishTransaction: async (_purchase: Purchase): Promise<void> => {},

  getPurchaseHistory: async (): Promise<Purchase[]> => [],

  endConnection: async (): Promise<void> => {},
};

export default IAPManager;
