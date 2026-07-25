import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useAuth } from '@/context/SupabaseProvider';

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY as string,
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY as string,
};
const REVENUECAT_TIMEOUT_MS = 12000;

const withTimeout = <T,>(promise: Promise<T>, message: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), REVENUECAT_TIMEOUT_MS);
    }),
  ]);

const getErrorMessage = (err: unknown) => {
  if (!(err instanceof Error)) return String(err);

  const details = err as Error & {
    code?: string;
    userInfo?: {
      readableErrorCode?: string;
      underlyingErrorMessage?: string;
      message?: string;
    };
  };

  return [
    details.userInfo?.underlyingErrorMessage,
    details.userInfo?.message,
    details.userInfo?.readableErrorCode,
    details.code,
    err.message,
  ].filter(Boolean).join(' - ');
};

// Environment variables kontrolü
if (!APIKeys.apple || !APIKeys.google) {
  console.error('RevenueCat API keys are missing!');
}

interface RevenueCatContextType {
  packages: PurchasesPackage[];
  isReady: boolean;
  error: string | null | undefined;
  initializeRevenueCat: () => Promise<void>;
  purchasePackage: (pack: PurchasesPackage) => Promise<string>;
  restorePurchases: () => Promise<CustomerInfo>;
  checkPremium: () => Promise<boolean>;
  isLoading: boolean;
  isPremium: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(
  undefined
);

export const RevenueCatProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const initializedForUserRef = useRef<string | null>(null);

  const checkPremium = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const active = typeof customerInfo.entitlements.active.premiummonthly !== "undefined";
      setIsPremium(active);
      if (active) {
        console.log("Premium aktif!");
      } else {
        console.log("Premium değil.");
      }
      return active;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('Premium check error:', err);
      setError(errorMessage);
      setIsPremium(false);
      return false;
    }
  }, []);

  const initializeRevenueCat = useCallback(async () => {
    const revenueCatUserId = userId ?? 'anonymous';
    if (initializedForUserRef.current === revenueCatUserId) return;

    try {
      setIsReady(false);
      setError(null);
      console.log('RevenueCat init started', {
        platform: Platform.OS,
        hasKey: Platform.OS === 'android' ? Boolean(APIKeys.google) : Boolean(APIKeys.apple),
        userId: revenueCatUserId,
      });
      // API keys kontrolü
      if (!APIKeys.apple || !APIKeys.google) {
        throw new Error('RevenueCat API keys are not configured');
      }

      if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: APIKeys.google, appUserID: userId });
      } else {
        Purchases.configure({ apiKey: APIKeys.apple, appUserID: userId });
      }

      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      const offerings = await withTimeout(
        Purchases.getOfferings(),
        'RevenueCat getOfferings timed out. Check Play Store billing setup and device network.'
      );

      const availablePackages = offerings.current?.availablePackages || [];
      setPackages(availablePackages);
      console.log(
        'RevenueCat packages:',
        availablePackages.map((pack) => ({
          identifier: pack.identifier,
          packageType: pack.packageType,
          productId: pack.product.identifier,
          price: pack.product.priceString,
        }))
      );
      if (availablePackages.length === 0) {
        throw new Error('RevenueCat current offering has no available packages');
      }
      initializedForUserRef.current = revenueCatUserId;
      setIsReady(true);
      setError(null);
      
      // checkPremium'u initialize'dan sonra çağır
      await checkPremium();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('RevenueCat init error:', err);
      setError(errorMessage);
      // Hata durumunda da isReady'yi true yap ki uygulama çökmesin
      setIsReady(true);
    }
  }, [checkPremium, userId]);

  const purchasePackage = async (pack: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const purchase = await Purchases.purchasePackage(pack);
      setError(null);
      await checkPremium();
      return purchase.productIdentifier;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('RevenueCat purchase error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      const customer = await Purchases.restorePurchases();
      setError(null);
      await checkPremium();
      return customer;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('RevenueCat restore error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(initializeRevenueCat);
  }, [initializeRevenueCat]);

  const value: RevenueCatContextType = useMemo(() => ({
    packages,
    isReady,
    error,
    initializeRevenueCat,
    purchasePackage,
    restorePurchases,
    checkPremium,
    isLoading,
    isPremium,
  }), [packages, isReady, error, initializeRevenueCat, isLoading, checkPremium, isPremium]);

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};
