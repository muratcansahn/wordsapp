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

interface RevenueCatContextType {
  packages: PurchasesPackage[];
  isReady: boolean;
  error: string | null | undefined;
  initializeRevenueCat: () => Promise<void>;
  purchasePackage: (pack: PurchasesPackage) => Promise<string>;
  restorePurchases: () => Promise<CustomerInfo>;
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

  const initializeRevenueCat = async () => {
    try {
      if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: APIKeys.google });
      } else {
        Purchases.configure({ apiKey: APIKeys.apple });
      }

      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.current?.availablePackages || [];
      setPackages(availablePackages);
      // Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      setIsReady(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      const purchase = await Purchases.purchasePackage(pack);
      setError(null);
      return purchase.productIdentifier;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const restorePurchases = async () => {
    try {
      const customer = await Purchases.restorePurchases();
      setError(null);
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
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
