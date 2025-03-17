import React from 'react'; 
import Svg, { Path, G, Circle } from 'react-native-svg'; 
import { Animated } from 'react-native';  

const AnimatedPath = Animated.createAnimatedComponent(Path); 
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);  

interface DetailedFishProps {   
  width?: number;   
  height?: number;   
  direction?: 'left' | 'right';   
  color?: string;
  mouthAnim?: Animated.Value;
  isEating?: boolean;
}  

const DetailedFish: React.FC<DetailedFishProps> = ({   
  width = 200,   
  height = 150,   
  direction = 'right',   
  color = '#FF8C00',
  mouthAnim = new Animated.Value(0),
  isEating = true
}) => {   
  return (     
    <AnimatedSvg       
      width={width}       
      height={height}       
      viewBox="0 0 512.001 512.001"       
      style={{         
        transform: [{ scaleX: direction === 'left' ? -1 : 1 }]       
      }}     
    >       
      <G fill={color}>         
        {/* Main fish body */}         
        <Path           
          d="M510.11,306.745c-0.134-0.189-13.482-18.958-24.994-36.68c-5.733-8.825-5.992-13.96-1.152-22.885             c10.979-20.25,22.637-42.153,22.754-42.372c2.583-4.856,0.853-10.885-3.913-13.629c-2.172-1.253-53.664-30.432-93.075-11.376             c-7.617,3.682-15.153,8.31-22.399,13.758c-8.493,6.385-20.497,13.238-29.437,9.639l-1.722-0.694             c-6.871-2.767-13.886-5.591-21.014-8.388l-2.516-15.327c-2.397-14.598-11.921-26.854-25.475-32.784l-45.304-19.822             c-3.792-1.658-7.073-4.312-9.488-7.671c-6.898-9.597-17.133-15.854-28.82-17.615c-11.688-1.763-23.31,1.198-32.733,8.336             l-3.857,2.923c-4.47,3.385-8.194,7.543-11.07,12.355l-27.182,45.5c-47.081,8.249-79.935,24.532-101.077,38.87             c-32.982,22.368-45.821,45.055-46.351,46.009c-1.71,3.081-1.71,6.825,0,9.906c1.369,2.463,33.962,59.323,130.659,81.565             c2.606,41.714,55.461,63.56,57.766,64.493c1.226,0.495,2.524,0.744,3.822,0.744s2.596-0.248,3.822-0.744             c2.225-0.9,51.577-21.297,57.324-60.25c8.011-1.637,16.023-3.665,23.984-5.956c15.38,14.194,43.938,27.729,47.364,29.326             c1.367,0.637,2.838,0.956,4.31,0.956c1.515,0,3.031-0.338,4.43-1.012c2.757-1.33,4.771-3.826,5.487-6.802             c0.285-1.182,6.328-26.549,6.747-47.052c0.664-0.265,1.337-0.534,1.998-0.799l6.911-2.762c7.846-3.126,19.22,3.565,28.255,9.742             c10.295,7.036,21.556,12.783,32.565,16.617c7.043,2.452,14.267,3.473,21.427,3.472c34.866-0.003,68.052-24.245,69.723-25.484             C512.339,317.544,513.332,311.271,510.11,306.745z"           
          fill="#FF8C00"         
        />                  
        {/* Fish fin */}         
        <Path           
          d="M180,250 L140,200 L140,300 Z"           
          fill="#FF7F00"         
        />       
      </G>              
      {/* Eye - shifted to the left */}       
      <Circle          
        cx="100"          
        cy="240"          
        r="20"          
        fill="#FFFFFF"        
      />              
      {/* Eye pupil */}       
      <Circle          
        cx="100"          
        cy="240"          
        r="10"          
        fill="#000000"        
      />     
      {/* Gill */}       
      <Path         
        d="M150,230 Q160,240 150,250"         
        stroke="#B25900"         
        strokeWidth="2"         
        fill="none"       
      />              
      <Path         
        d="M250,230 Q260,240 250,250 M230,220 Q240,230 230,240 M220,250 Q230,260 220,270 M270,240 Q280,250 270,260"         
        stroke="#FF6600"         
        strokeWidth="1.5"         
        fill="none"       
      />  
      {/* Balık ağzı - yeme animasyonu */}
      <AnimatedPath
        d={mouthAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["M30,240 Q40,240 50,240", "M25,230 Q40,260 55,230"] // Ağzın kapalı ve açık halleri
        })}
        stroke="#000"
        strokeWidth="2"
        fill="none"
        transform="translate(-10, 13)"
      />     
    </AnimatedSvg>   
  ); 
};  

export default DetailedFish;