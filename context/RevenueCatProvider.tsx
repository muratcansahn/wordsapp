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

import { useAuth } from '@/context/SupabaseProvider';

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
  const { user } = useAuth();
  
  const checkPremium = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      if (typeof customerInfo.entitlements.active.premiummonthly !== "undefined") {
        console.log("Premium aktif!");
        return true;
      } else {
        console.log("Premium değil.");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Premium check error:', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

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

      const availablePackages = offerings.current?.availablePackages || [];
      setPackages(availablePackages);
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      setIsReady(true);
      setError(null);
      
      // checkPremium'u initialize'dan sonra çağır
      await checkPremium();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
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
  }, [user]);

  const value: RevenueCatContextType = {
    packages,
    isReady,
    error,
    initializeRevenueCat,
    purchasePackage,
    restorePurchases,
    checkPremium,
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
