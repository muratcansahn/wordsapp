import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { FishTypes } from '../../assets/svg/fish';
import { getHungerColor } from '../screen/dashboard/utils';

type FishType = keyof typeof FishTypes;

interface FishComponentProps {
  width: number;
  height: number;
  mouthAnim: Animated.Value;
  direction?: "right" | "left";
  isEating: boolean;
  type: FishType;
  hungerLevel?: number;
  lastFeedTime?: number;
}

export const FishComponent: React.FC<FishComponentProps> = ({
  width,
  height,
  mouthAnim,
  direction,
  isEating,
  type,
  hungerLevel,
  lastFeedTime
}) => {
  const SelectedFish = FishTypes[type];
  
 

  return (
    <View style={{ width, height }}>
      <View style={styles.hungerContainer}>
        {hungerLevel != null && (
        <View style={[styles.hungerBar, { backgroundColor: '#e0e0e0' }]}>
  <View 
    style={[
      styles.hungerIndicator, 
      { 
        width: `${hungerLevel}%`,
        backgroundColor: getHungerColor(hungerLevel)
      }
    ]} 
  />
        </View>
)}
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            transform: [{ scaleX: direction === 'left' ? -1 : 1 }],
          }}
        >
          <SelectedFish
            width={width}
            height={height}
            mouthAnim={mouthAnim}
            direction={direction}
            isEating={isEating}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hungerContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center', // ortaya hizala
    zIndex: 1,
  },
  hungerBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  hungerIndicator: {
    height: '100%',
    borderRadius: 2,
  }
});
