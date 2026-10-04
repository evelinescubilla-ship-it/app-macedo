// lib/theme.ts
// Paleta basada en la imagen "Delicate Harmony" (palettepoint.com)

export type ThemeMode = 'light' | 'dark';

export const palette = {
  majorTom: '#080B79',
  darkGalaxy: '#1016A5',
  cosmicVoid: '#060439',
  dragonlord: '#5A47C4',
  shyMoment: '#A9A5F3',
};

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  gradientColors: readonly [string, string];
  textMain: string;
  textSub: string;
  accent: string;
  ctaBg: string;
  ctaText: string;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  inputBg: string;
  inputText: string;
  inputIcon: string;
  placeholder: string;
  alertBg: string;
  alertText: string;
  successBg: string;
  successText: string;
}

const lightTheme: AppTheme = {
  mode: 'light',
  isDark: false,
  gradientColors: ['#F4F3FE', palette.shyMoment],
  textMain: palette.cosmicVoid,
  textSub: palette.dragonlord,
  accent: palette.darkGalaxy,
  ctaBg: palette.darkGalaxy,
  ctaText: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.85)',
  cardBorder: 'rgba(90, 71, 196, 0.2)',
  iconBg: 'rgba(16, 22, 165, 0.1)',
  inputBg: '#FFFFFF',
  inputText: palette.cosmicVoid,
  inputIcon: palette.dragonlord,
  placeholder: '#8B88B8',
  alertBg: '#FFE4E8',
  alertText: '#E11D48',
  successBg: '#D1FAE5',
  successText: '#047857',
};

const darkTheme: AppTheme = {
  mode: 'dark',
  isDark: true,
  gradientColors: [palette.cosmicVoid, palette.majorTom],
  textMain: '#FFFFFF',
  textSub: palette.shyMoment,
  accent: palette.shyMoment,
  ctaBg: palette.dragonlord,
  ctaText: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  cardBorder: 'rgba(169, 165, 243, 0.25)',
  iconBg: 'rgba(169, 165, 243, 0.15)',
  inputBg: 'rgba(255, 255, 255, 0.1)',
  inputText: '#FFFFFF',
  inputIcon: palette.shyMoment,
  placeholder: '#8F8CCB',
  alertBg: 'rgba(251, 113, 133, 0.2)',
  alertText: '#FB7185',
  successBg: 'rgba(52, 211, 153, 0.18)',
  successText: '#34D399',
};

// Modo automático: claro de 7:00 a 19:00, oscuro el resto del día
export const getAutoMode = (): ThemeMode => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
};

export const getTheme = (mode: ThemeMode = getAutoMode()): AppTheme =>
  mode === 'dark' ? darkTheme : lightTheme;

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