import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface WaveBackgroundProps {
  children?: React.ReactNode;
  edges?: Edge[];
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({ children, edges = ['top', 'bottom', 'left', 'right'] }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1565C0' }]} edges={edges}>
      <LinearGradient
        colors={['#1E88E5', '#0D47A1']}
        style={styles.background}
      >
        <View style={styles.waveContainer}>
          {/* Arka plan için temel mavi renk */}
          <Svg height={height} width={width} style={styles.baseSvg}>
            <Rect x="0" y="0" width={width} height={height} fill="#1565C0" />
          </Svg>
          
          {/* İlk dalga */}
          <Svg
            height={height}
            width={width}
            viewBox={`0 0 ${width} ${height}`}
            style={styles.waveSvg}
            preserveAspectRatio="xMinYMin slice"
          >
            <Path
              d={`M0 ${height * 0.2} 
                 C${width * 0.2} ${height * 0.15}, ${width * 0.35} ${height * 0.25}, ${width * 0.5} ${height * 0.2} 
                 C${width * 0.65} ${height * 0.15}, ${width * 0.8} ${height * 0.25}, ${width} ${height * 0.2} 
                 L${width} ${height} 
                 L0 ${height} 
                 Z`}
              fill="#0D47A1"
              opacity={0.6}
            />
          </Svg>
          
          {/* İkinci dalga */}
          <Svg
            height={height}
            width={width}
            viewBox={`0 0 ${width} ${height}`}
            style={[styles.waveSvg, styles.secondWave]}
            preserveAspectRatio="xMinYMin slice"
          >
            <Path
              d={`M0 ${height * 0.25} 
                 C${width * 0.25} ${height * 0.2}, ${width * 0.4} ${height * 0.3}, ${width * 0.6} ${height * 0.25} 
                 C${width * 0.7} ${height * 0.2}, ${width * 0.8} ${height * 0.27}, ${width} ${height * 0.22} 
                 L${width} ${height} 
                 L0 ${height} 
                 Z`}
              fill="#1976D2"
              opacity={0.4}
            />
          </Svg>
        </View>
        {children}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  waveContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  baseSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  secondWave: {
    top: 30,
  },
});

export default WaveBackground;
