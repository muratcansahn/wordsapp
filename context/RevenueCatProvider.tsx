import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY as string,
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY as string,
};

// Environment variables kontrolü
if (!APIKeys.apple || !APIKeys.google) {
  console.error('RevenueCat API keys are missing!');
  console.error('EXPO_PUBLIC_RC_APPLE_KEY:', APIKeys.apple);
  console.error('EXPO_PUBLIC_RC_GOOGLE_KEY:', APIKeys.google);
}

console.log("APIKeys", APIKeys)

interface RevenueCatContextType {
  packages: PurchasesPackage[];
  isReady: boolean;
  error: string | null | undefined;
  initializeRevenueCat: () => Promise<void>;
  purchasePackage: (pack: PurchasesPackage) => Promise<string>;
  restorePurchases: () => Promise<CustomerInfo>;
  isLoading: boolean;
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

  const initializeRevenueCat = async () => {
    try {
      // API keys kontrolü
      if (!APIKeys.apple || !APIKeys.google) {
        throw new Error('RevenueCat API keys are not configured');
      }

      if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: APIKeys.google });
      } else {
        Purchases.configure({ apiKey: APIKeys.apple });
      }

      const offerings = await Purchases.getOfferings();
      console.log("offerings", offerings)

      const availablePackages = offerings.current?.availablePackages || [];
      setPackages(availablePackages);
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      setIsReady(true);
      setError(null);
      console.log("packages", packages)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('RevenueCat initialization error:', errorMessage);
      setError(errorMessage);
      // Hata durumunda da isReady'yi true yap ki uygulama çökmesin
      setIsReady(true);
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const purchase = await Purchases.purchasePackage(pack);
      setError(null);
      return purchase.productIdentifier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
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
      return customer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const value: RevenueCatContextType = {
    packages,
    isReady,
    error,
    initializeRevenueCat,
    purchasePackage,
    restorePurchases,
    isLoading,
  };

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
