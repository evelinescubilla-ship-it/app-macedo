 // lib/theme.ts

export const getTheme = () => {
  const hour = new Date().getHours();
  // Día: de 7:00 AM a 7:00 PM (19:00)
  const isDay = hour >= 7 && hour < 19;

  if (isDay) {
    return {
      isDay: true,
      gradientColors: ['#E0E7FF', '#A9A5F3'] as [string, string],
      textMain: '#060439',
      textSub: '#5A47C4',
      accent: '#1016A5',
      ctaBg: '#1016A5',
      ctaText: '#FFFFFF',
      cardBg: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(255, 255, 255, 0.5)',
      inputBg: '#FFFFFF',
      alertBg: '#FFF1F2',
      alertText: '#FB7185',
    };
  } else {
    return {
      isDay: false,
      gradientColors: ['#060439', '#1016A5'] as [string, string],
      textMain: '#FFFFFF',
      textSub: '#A9A5F3',
      accent: '#22D3EE',
      ctaBg: '#22D3EE',
      ctaText: '#060439',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
      inputBg: 'rgba(255, 255, 255, 0.9)',
      alertBg: 'rgba(251, 113, 133, 0.2)',
      alertText: '#FB7185',
    };
  }
};

// Frases para alegrar el día
export const getRandomPhrase = () => {
  const phrases = [
    'Que el stock esté tan lleno como tu café de la mañana. ☕',
    'Hoy es un buen día para vender (o al menos para no perder cosas).',
    'Tu inventario te ama, ¡no lo dejes en cero! ❤️',
    'Organizando el caos, un producto a la vez. 🧠',
    'Menos papeles, más ventas. ¡A darle! 🚀',
    'Si el stock baja, sube el ánimo. ¡Tú puedes! 💪',
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};