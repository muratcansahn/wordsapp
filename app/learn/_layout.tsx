import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

export default function LearnLayout() {
  const { t } = useTranslation();
  const { mode } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[mode].background,
        },
        headerTintColor: Colors[mode].text,
        headerShadowVisible: false,
        headerBackVisible: true,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('learnLayout.indexTitle'),
        }}
      />
      <Stack.Screen
        name="study-mode"
        options={{
          title: t('learnLayout.studyModeTitle'),
        }}
      />
    </Stack>
  );
}
