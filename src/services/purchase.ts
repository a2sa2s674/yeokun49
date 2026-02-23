import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  apple: 'YOUR_REVENUECAT_APPLE_API_KEY',
  google: 'YOUR_REVENUECAT_GOOGLE_API_KEY',
};

export const PRODUCT_IDS = {
  premiumGuardian: 'premium_guardian_pack',
  talisman: 'digital_talisman',
  aiChatUnlimited: 'ai_chat_unlimited',
} as const;

export const initPurchases = async () => {
  const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
  await Purchases.configure({ apiKey });
};

export const getProducts = async (): Promise<PurchasesPackage[]> => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

export const purchaseProduct = async (
  pkg: PurchasesPackage
): Promise<CustomerInfo> => {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
};

export const restorePurchases = async (): Promise<CustomerInfo> => {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
};
