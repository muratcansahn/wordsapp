import React from 'react';
import { ScrollView, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/common/view';
import { ThemedText } from '@/components/common/typography';
import { Collapsible } from '@/components/common/collapsible';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import {
  BUTTON_HEIGHT,
  BUTTON_WIDTH,
  FLEX,
  FONT_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { GlowButton } from '@/components/common/buttons/glow-button';
import Container from '@/components/common/container';
import { Mail } from 'lucide-react-native';

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
    <Container
      edges={['bottom']}
      bgColor={Colors[mode].background}
      style={styles.container}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
      <ThemedView style={styles.buttonContainer}>
        <GlowButton
          onPress={handleContactSupport}
          bgColor={Colors[mode].background}
          colors={[
            Colors[mode].background,
            Colors[mode].primary,
            Colors[mode].background,
          ]}
          width={BUTTON_WIDTH.lg}
          height={BUTTON_HEIGHT.lg}
        >
          <Mail size={36} color={Colors[mode].text} />
        </GlowButton>
      </ThemedView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: FLEX.one,
    paddingHorizontal: PADDING.md,
  },
  scrollView: {
    flexGrow: FLEX.one,
    paddingTop: PADDING.md,
  },
  description: {
    marginBottom: MARGIN.xl,
  },
  faqContainer: {
    marginBottom: MARGIN.md,
  },
  question: {
    fontSize: FONT_SIZE.md,
  },
  answer: {
    fontSize: FONT_SIZE.md,
    marginTop: MARGIN.sm,
  },
  buttonContainer: {
    alignSelf: 'center',
    marginBottom: MARGIN.xl,
  },
});

export default HelpScreen;
