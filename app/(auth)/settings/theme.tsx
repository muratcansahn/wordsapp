import React from 'react';
import { View, Text } from 'react-native';

// Tema ayarları kaldırıldı. Sadece bilgi amaçlı boş ekran.
const ThemeSettings: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Bu ekranda tema ayarları artık bulunmamaktadır. Uygulama her zaman açık (light) modda çalışacaktır.</Text>
  </View>
);

export default ThemeSettings;
