import { StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { features } from '@/components/screen/home/HomeCards';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

interface FeatureItemProps {
  icon: string;
  route: string;
  name: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, route, name }) => {
  const { mode } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = () => {
    router.push(`/${route}` as Href<string>);
  };

  return (
    <ThemedView style={styles.themedView}>
      <PressableOpacity
        onPress={handlePress}
        style={[styles.gridItem, { backgroundColor: Colors[mode].button }]}
      >
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={ICON_SIZE.sm}
          color={Colors[mode].text}
        />
        <ThemedText style={styles.gridItemText}>{t(name)}</ThemedText>
      </PressableOpacity>
    </ThemedView>
  );
};

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={features}
        renderItem={({ item }) => (
          <FeatureItem icon={item.icon} route={item.route} name={item.name} />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  description: {
    margin: MARGIN.md,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
  },
  gridContainer: {
    padding: PADDING.sm,
  },
  themedView: {
    flex: FLEX.one,
    backgroundColor: 'transparent',
  },
  gridItem: {
    flex: FLEX.one,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    alignItems: 'center',
    margin: MARGIN.md,
    height: BUTTON_HEIGHT.xl,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
  },
  gridItemText: {
    marginTop: MARGIN.lg,
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
  },
});
