import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { Word, markAsLearned, markAsUnknown } from '@/store/wordSlice';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

export default function WordListScreen() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type } = params;
  const dispatch = useDispatch();
  
  const [title, setTitle] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  
  // Redux'tan kelime listesini al
  const { words } = useSelector((state: RootState) => state.words);
  
  useEffect(() => {
    // URL parametresine göre kelimeleri filtrele
    if (type === 'learned') {
      setFilteredWords(words.filter(word => word.learned));
      setTitle(t('wordList.learnedWords') || 'Öğrenilen Kelimeler');
    } else if (type === 'unknown') {
      setFilteredWords(words.filter(word => word.unknown));
      setTitle(t('wordList.unknownWords') || 'Bilinmeyen Kelimeler');
    } else {
      setFilteredWords(words);
      setTitle(t('wordList.allWords') || 'Tüm Kelimeler');
    }
  }, [type, words, t]);
  
  // Kelimeyi öğrenildi olarak işaretle
  const handleMarkAsLearned = (wordId: string) => {
    dispatch(markAsLearned(wordId));
    Alert.alert('Başarılı', 'Kelime öğrenildi olarak işaretlendi');
  };

  // Kelimeyi bilinmiyor olarak işaretle
  const handleMarkAsUnknown = (wordId: string) => {
    dispatch(markAsUnknown(wordId));
    Alert.alert('Başarılı', 'Kelime bilinmiyor olarak işaretlendi');
  };

  const renderItem = ({ item }: { item: Word }) => {
    // Kelime durumuna göre gösterilecek buton
    let actionButton = null;
    
    if (type === 'learned' && !item.unknown) {
      // Öğrenilen kelimeler listesindeyiz, "Bilinmiyor" olarak işaretleme butonu göster
      actionButton = (
        <TouchableOpacity 
          style={styles.actionButtonRed}
          onPress={() => handleMarkAsUnknown(item.id)}
        >
          <ThemedText style={styles.actionButtonText}>Bilinmiyor</ThemedText>
        </TouchableOpacity>
      );
    } else if (type === 'unknown' && !item.learned) {
      // Bilinmeyen kelimeler listesindeyiz, "Öğrenildi" olarak işaretleme butonu göster
      actionButton = (
        <TouchableOpacity 
          style={styles.actionButtonGreen}
          onPress={() => handleMarkAsLearned(item.id)}
        >
          <ThemedText style={styles.actionButtonText}>Öğrenildi</ThemedText>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={[styles.wordCard, { backgroundColor: Colors[mode].card }]}>
        <View style={styles.wordContent}>
          <ThemedText style={styles.wordText}>{item.text}</ThemedText>
          <ThemedText style={styles.translationText}>{item.translation}</ThemedText>
        </View>
        {actionButton}
      </View>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={ICON_SIZE.sm} color={Colors[mode].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={filteredWords}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {t('wordList.noWordsFound') || 'Kelime bulunamadı'}
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    paddingTop: PADDING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING.md,
    marginBottom: MARGIN.md,
  },
  backButton: {
    padding: PADDING.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: ICON_SIZE.sm + PADDING.xs * 2,
  },
  listContent: {
    padding: PADDING.md,
    paddingBottom: PADDING.xl * 2,
  },
  wordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: MARGIN.md,
    marginHorizontal: MARGIN.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: MARGIN.xxs,
  },
  translationText: {
    fontSize: FONT_SIZE.sm,
    opacity: 0.7,
  },
  actionButtonGreen: {
    backgroundColor: '#10B981',
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.sm,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonRed: {
    backgroundColor: '#EF4444',
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.sm,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: PADDING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    opacity: 0.7,
  },
});
