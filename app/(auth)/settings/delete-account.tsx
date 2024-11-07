import React, { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import RadioButton from '@/components/common/buttons/radio-button';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { useTranslation } from 'react-i18next';
import Dialog from '@/components/common/modal/dialog';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { FLEX, FONT_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import ShinyButton from '@/components/common/buttons/shiny-button';
import { DeleteAccountReasons } from '@/data/DeleteAccount';

const DeleteAccountScreen: React.FC = () => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const { mode } = useTheme();

  const handleSelectReason = useCallback((reason: string) => {
    setSelectedReason(reason);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {t('settings.deleteAccount.title')}
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        {t('settings.deleteAccount.subtitle')}
      </ThemedText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {DeleteAccountReasons.map((reason, index) => (
          <View style={{ marginBottom: MARGIN.lg }} key={index}>
            <RadioButton
              selected={selectedReason === reason.value}
              onSelect={() => handleSelectReason(reason.value)}
              label={t(reason.label)}
              color={Colors[mode].error}
              accessibilityLabel={reason.label}
            />
          </View>
        ))}
      </ScrollView>
      <Dialog
        title={t('settings.deleteAccount.deleteDialog.title')}
        description={t('settings.deleteAccount.deleteDialog.description')}
        bgColor={Colors[mode].button}
        rightButton={t('buttons.delete')}
        visible={visible}
        setVisible={setVisible}
      >
        <ShinyButton
          onPress={() => {
            setVisible(true);
          }}
          bgColor={'#ff000099'}
          buttonColor="red"
        >
          <ThemedText
            type="default"
            style={styles.deleteButton}
            darkColor="white"
            lightColor="white"
          >
            {t('buttons.delete')}
          </ThemedText>
        </ShinyButton>
      </Dialog>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    padding: PADDING.md,
  },
  title: {
    marginBottom: MARGIN.lg,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: MARGIN.lg,
    textAlign: 'center',
  },
  deleteButton: {
    fontSize: FONT_SIZE.lg,
    fontFamily: 'Neulis',
  },
});

export default DeleteAccountScreen;
