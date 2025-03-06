import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Animated } from 'react-native';

// Animated.createAnimatedComponent ile SVG bileşenlerini animasyonlu hale getiriyoruz
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface BlueFishProps {
  width?: number;
  height?: number;
  mouthAnim?: Animated.Value;
  direction?: 'left' | 'right';
  isEating?: boolean;
}

const BlueFish: React.FC<BlueFishProps> = ({
  width = 50,
  height = 30,
  mouthAnim = new Animated.Value(0),
  direction = 'right',
  isEating = false
}) => {
  // Ağız genişliği için interpolasyon
  const mouthWidth = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4]
  });

  // Ağız açılması için interpolasyon
  const mouthHeight = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3]
  });

  // Balık renkleri
  const bodyColor = '#4169E1'; // Mavi
  const finColor = '#1E90FF'; // Açık mavi
  const mouthColor = isEating ? '#00BFFF' : '#003366';
  const eyeColor = '#FFFFFF';
  const pupilColor = '#000000';

  // SVG path için d değerini oluşturan fonksiyon
  // Animated.Value'ları doğrudan kullanamadığımız için bu şekilde yapıyoruz
  const createMouthPath = () => {
    // Animasyon değerini 0-1 arası bir sayıya dönüştürüyoruz
    const width = 44; // Sabit başlangıç değeri
    const height = 15; // Sabit başlangıç değeri
    
    // Animated değerleri doğrudan kullanmak yerine sabit string döndürüyoruz
    return `M44,15 Q47,15 44,17`;
  };

  return (
    <AnimatedSvg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      style={{
        transform: [{ scaleX: direction === 'left' ? -1 : 1 }]
      }}
    >
      {/* Balık gövdesi */}
      <Path
        d="M10,15 C10,7 20,3 35,8 C45,12 45,18 35,22 C20,27 10,23 10,15 Z"
        fill={bodyColor}
      />
      
      {/* Kuyruk yüzgeci */}
      <Path
        d="M10,15 C5,10 2,14 1,15 C2,16 5,20 10,15 Z"
        fill={finColor}
      />
      
      {/* Üst yüzgeç */}
      <Path
        d="M25,5 C28,3 31,6 28,9 C25,7 24,6 25,5 Z"
        fill={finColor}
      />
      
      {/* Alt yüzgeç */}
      <Path
        d="M25,25 C28,27 31,24 28,21 C25,23 24,24 25,25 Z"
        fill={finColor}
      />
      
      {/* Göz */}
      <Circle cx="38" cy="12" r="2" fill={eyeColor} />
      <Circle cx="38.5" cy="11.5" r="1" fill={pupilColor} />
      
      {/* Ağız - Animasyonlu */}
      <AnimatedPath
        d={createMouthPath()}
        stroke={mouthColor}
        strokeWidth="1.5"
        fill="none"
      />
    </AnimatedSvg>
  );
};

export default BlueFish;
