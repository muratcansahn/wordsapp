import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

export default function LearnLayout() {
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
          title: 'Öğren',
        }}
      />
      <Stack.Screen
        name="study-mode"
        options={{
          title: 'Çalışma Modu',
        }}
      />
    </Stack>
  );
}
