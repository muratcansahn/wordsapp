import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n/languages';
import { ThemedView } from '@/components/common/view';
import { FLEX, PADDING } from '@/constants/AppConstants';
import LanguageButton from '@/components/common/buttons/language-button';

const LanguageSettings = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ThemedView style={styles.container}>
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
});

export default LanguageSettings;
