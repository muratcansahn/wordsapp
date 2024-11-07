import React, { useCallback } from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Image } from 'expo-image';
import Searchbar from '@/components/common/searchbar';
import { ScreenWidth, FLEX, MARGIN } from '@/constants/AppConstants';
import Container from '@/components/common/container';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { setQuery } from '@/store/slices/searchSlice';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';

const exploreData = Array.from(
  { length: 30 },
  (_, index) => `https://picsum.photos/200/300?${index}`
);

const SearchScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useSelector((state: RootState) => state.search.query);
  const { mode } = useTheme();
  const renderExploreItem: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <Image
        source={{ uri: item }}
        style={[
          styles.exploreImage,
          {
            marginRight: (index + 1) % 3 === 0 ? 0 : MARGIN.xxs,
            marginBottom: MARGIN.xxs,
          },
        ]}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <Container
      style={styles.container}
      bgColor={Colors[mode].background}
      edges={['top']}
    >
      <Searchbar
        value={query}
        onChangeText={(text) => dispatch(setQuery(text))}
      />
      <FlatList
        data={exploreData}
        renderItem={renderExploreItem}
        keyExtractor={keyExtractor}
        numColumns={3}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
};

const imageSize = (ScreenWidth - 2) / 3; // 2 piksel boşluk için

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  list: {
    flex: FLEX.one,
  },
  exploreImage: {
    width: imageSize,
    height: imageSize,
  },
});

export default SearchScreen;
