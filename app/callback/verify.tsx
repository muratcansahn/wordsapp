import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/SupabaseProvider';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Loader from '@/components/common/loader/native-loader';
import { FLEX, MARGIN, PADDING } from '@/constants/AppConstants';

const Verify = () => {
  const { isLoading, session } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.back();
    }
  }, [session]);

  if (!session && !isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Loader size="large" />
        <ThemedText style={styles.text} type="default">
          {t('auth.pleaseCheckYourEmail')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Loader size="large" />
      <ThemedText style={styles.text} type="default">
        {t('auth.verifying')}
      </ThemedText>
    </ThemedView>
  );
};

export default Verify;

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: MARGIN.xl,
    fontWeight: 'bold',
    paddingHorizontal: PADDING.xl,
    textAlign: 'center',
  },
});
