import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/buttons/button';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

const ModalTestScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const modals = [
    {
      title: 'Paywall (Çift Seçenek)',
      route: '/(auth)/(modals)/paywall-double',
      description: 'İki abonelik seçeneği sunan ödeme duvarı'
    },

  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Modal Test Ekranı</Text>
      <Text style={styles.subtitle}>
        Tüm modalları test etmek için aşağıdaki butonları kullanabilirsiniz
      </Text>

      <View style={styles.modalList}>
        {modals.map((modal, index) => (
          <View key={index} style={styles.modalItem}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <Text style={styles.modalDescription}>{modal.description}</Text>
            <Button
              onPress={() => router.push(modal.route)}
              style={[styles.button, { backgroundColor: Colors.light.primary }]}
            >
              <Text style={{ color: '#fff' }}>Göster</Text>
            </Button>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalList: {
    gap: 16,
  },
  modalItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  button: {
    width: '100%',
  },
});

export default ModalTestScreen;
