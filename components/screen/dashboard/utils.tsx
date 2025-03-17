export const getHungerColor = (hungerLevel: number): string => {
    if (hungerLevel >= 70) return '#4CAF50'; // Tok - Yeşil
    if (hungerLevel >= 30) return '#FFC107'; // Orta - Sarı
    return '#F44336'; // Aç - Kırmızı
  };