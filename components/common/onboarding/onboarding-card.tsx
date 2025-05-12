import * as React from 'react';
import { ReactNode, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/theme/useTheme';

interface OnboardingCardProps {
  children: ReactNode;
  headerText?: string;
  descriptionText?: string;
  borderColor?: string;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  children,
  headerText,
  descriptionText,
  borderColor = '#F7A943' // Varsayılan turuncu kenarlık
}) => {
  const { mode } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const styles = useMemo(() => createStyles(mode, screenWidth, screenHeight, borderColor), 
    [mode, screenWidth, screenHeight, borderColor]);

  return (
    <View style={styles.card}>
      {/* İçerik (ikonlar, animasyonlar vs.) */}
      {children}
      
      {/* Başlık (opsiyonel) */}
      {headerText && <Text style={styles.headerText}>{headerText}</Text>}
      
      {/* Açıklama (opsiyonel) */}
      {descriptionText && <Text style={styles.secondaryFooter}>{descriptionText}</Text>}
    </View>
  );
};

const createStyles = (
  mode: 'light' | 'dark', 
  screenWidth: number, 
  screenHeight: number,
  borderColor: string
) => StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Kart arka planı beyaz
    borderRadius: 20,
    width: '100%',
    // maxWidth: Math.min(400, screenWidth - 32),
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: borderColor, // Değiştirilebilir kenarlık rengi
  },
  headerText: {
    fontSize: screenWidth < 350 ? 20 : 22,
    fontWeight: '700',
    color: '#4361EE', // Başlık mavi
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: screenWidth < 350 ? 28 : 32
  },
  secondaryFooter: {
    fontSize: 17,
    color: mode === 'dark' ? '#e4e4e4' : '#3a3a3a',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export default OnboardingCard;
