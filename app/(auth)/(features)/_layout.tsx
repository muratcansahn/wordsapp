import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import HeaderBack from '@/components/navigation/header/header-back';

const CardsStack = () => {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: HeaderBack,
      }}
    >
      <Stack.Screen
        name="admob"
        options={{
          title: t('home.admob'),
        }}
      />
      <Stack.Screen
        name="social-sharing"
        options={{
          title: 'Share',
          presentation: 'modal',
          headerLeft: HeaderBack,
        }}
      />
    </Stack>
  );
};

export default CardsStack;
