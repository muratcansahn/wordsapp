import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Platform, NativeModules, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { languages } from '@/i18n/languages';
import { ThemedView } from '@/components/common/view';
import { FLEX, PADDING } from '@/constants/AppConstants';
import LanguageButton from '@/components/common/buttons/language-button';

const LanguageSettings = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const [isLoading, setIsLoading] = useState(false);

  // Uygulamayı yeniden başlatma fonksiyonu
  const restartApp = async () => {
    if (Platform.OS === 'web') {
      // Web için sayfayı yeniden yükle
      window.location.reload();
      return;
    }

    try {
      // Geliştirme modunda DevSettings ile yeniden başlatma
      if (__DEV__ && NativeModules.DevSettings) {
        NativeModules.DevSettings.reload();
        return;
      }

      // Expo ortamında olup olmadığımızı kontrol et
      const isExpo = Constants.executionEnvironment === 'standalone' || 
                    Constants.executionEnvironment === 'storeClient';

      if (isExpo) {
        // Expo ortamında tam yeniden başlatma için kullanıcıya bilgi ver
        Alert.alert(
          'Dil Değişikliği',
          'Dil değişikliğinin tam olarak uygulanması için uygulamayı kapatmanız ve tekrar açmanız gerekiyor.',
          [
            { text: 'Tamam', onPress: () => {
              // Uygulama içinde tüm ekranları sıfırla
              router.replace('/');
            }}
          ]
        );
      } else {
        // Native mod için
        if (Platform.OS === 'ios') {
          // iOS için
          if (NativeModules.RCTRestart) {
            NativeModules.RCTRestart.Restart();
            return;
          }
        } else if (Platform.OS === 'android') {
          // Android için
          const bundleId = Application.applicationId;
          if (bundleId && NativeModules.DevSettings) {
            NativeModules.DevSettings.reload();
            return;
          }
        }

        // Son çare olarak ana sayfaya yönlendir
        router.replace('/');
      }
    } catch (error) {
      console.error('Uygulama yeniden başlatma hatası:', error);
      // Hata durumunda ana sayfaya yönlendir
      router.replace('/');
    }
  };

  // Dil değiştirme fonksiyonu
  const changeLanguage = async (lang: string) => {
    if (currentLanguage === lang) return;
    
    try {
      setIsLoading(true);
      // Dil ayarını kaydet
      await AsyncStorage.setItem('language', lang);
      // Dili değiştir
      await i18n.changeLanguage(lang);
      
      // Kısa bir gecikme ekleyerek dil değişikliğinin uygulanmasını sağla
      setTimeout(() => {
        // Uygulamayı tamamen yeniden başlat
        restartApp();
      }, 500);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : (
        <FlatList
          data={languages}
          style={styles.flatlist}
          renderItem={({ item }) => (
            <LanguageButton
              item={item}
              isActive={currentLanguage === item.code}
              onPress={() => changeLanguage(item.code)}
            />
          )}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  flatlist: {
    padding: PADDING.md,
  },
  loadingContainer: {
    flex: FLEX.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LanguageSettings;
