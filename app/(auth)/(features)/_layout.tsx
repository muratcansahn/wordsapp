import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import HeaderBack from '@/components/navigation/header/HeaderBack';

const CardsStack = () => {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerLeft: HeaderBack,
      }}
    >
      <Stack.Screen
        name="admob"
        options={{
          presentation: 'modal',
          title: t('home.admob'),
        }}
      />
      <Stack.Screen
        name="social-sharing"
        options={{
          title: t('home.socialSharing'),
        }}
      />
    </Stack>
  );
};

export default CardsStack;
