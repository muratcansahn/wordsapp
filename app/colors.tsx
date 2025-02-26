import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { Stack } from 'expo-router';

export default function ColorsPage() {
  const { mode } = useTheme();
  const colors = Colors[mode];
  
  // Tüm renkleri bir diziye dönüştürelim
  const colorEntries = Object.entries(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Renk Paleti',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: mode === 'dark' ? '#000' : '#fff',
      }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          {mode === 'dark' ? 'Koyu Tema' : 'Açık Tema'} Renk Paleti
        </Text>
        
        <View style={styles.colorGrid}>
          {colorEntries.map(([name, value]) => (
            <View key={name} style={styles.colorContainer}>
              <View 
                style={[
                  styles.colorBox, 
                  { 
                    backgroundColor: value,
                    borderColor: mode === 'dark' ? '#444' : '#ddd'
                  }
                ]} 
              />
              <Text style={[styles.colorName, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.colorValue, { color: colors.text }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorContainer: {
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
  },
  colorBox: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  colorName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 12,
  },
});
