import React from 'react';
import { ScrollView, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { Collapsible } from '@/components/common/collapsible';
import Button from '@/components/common/buttons/button';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';

const HelpScreen = () => {
  const { t } = useTranslation();
  const { mode } = useTheme();

  const faqs =
    (t('settings.help.faqs', { returnObjects: true }) as {
      question: string;
      answer: string;
    }[]) || [];

  const handleContactSupport = () => {
    Linking.openURL('mailto:info@shipmobilefast.com');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.container}>
        <ThemedText style={styles.header} type="title">
          {t('settings.help.title')}
        </ThemedText>
        <ThemedText style={styles.description}>
          {t('settings.help.description')}
        </ThemedText>

        {faqs.map((faq, index) => (
          <ThemedView key={index} style={styles.faqContainer}>
            <Collapsible title={faq.question}>
              <ThemedText style={styles.answer}>{faq.answer}</ThemedText>
            </Collapsible>
          </ThemedView>
        ))}

        <Button
          style={styles.button}
          onPress={handleContactSupport}
          bgColor={Colors[mode].primary}
          textStyle={styles.buttonText}
        >
          <ThemedText style={styles.buttonText} darkColor="black">
            {t('settings.help.contactSupport')}
          </ThemedText>
        </Button>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    padding: PADDING.sm,
  },
  header: {
    fontSize: FONT_SIZE.xxxl,
    marginBottom: MARGIN.lg,
  },
  description: {
    fontSize: FONT_SIZE.md,
    marginBottom: MARGIN.xl,
  },
  faqContainer: {
    marginBottom: MARGIN.lg,
  },
  question: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  answer: {
    fontSize: FONT_SIZE.md,
    marginTop: MARGIN.sm,
  },
  button: {
    marginTop: MARGIN.xl,
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
  },
});

export default HelpScreen;
