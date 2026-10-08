 import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { useEstado, cerrarSesionLocal } from '@/lib/store';
import { clearSession } from '@/lib/session';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { theme, mode } = useTheme();
  const estado = useEstado();

  // Si el servidor dice que la sesión venció (y no se pudo renovar), volvemos al login
  useEffect(() => {
    if (estado.sesionVencida) {
      clearSession();
      cerrarSesionLocal();
      router.replace('/');
      Alert.alert('Sesión vencida', 'Tu sesión venció. Inicia sesión de nuevo.');
    }
  }, [estado.sesionVencida]);

  return (
    <>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.gradientColors[0] },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="products" />
        <Stack.Screen name="add-product" />
        <Stack.Screen name="movimiento" />
        <Stack.Screen name="historial" />
        <Stack.Screen name="reportes" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <Navigator />
    </ThemeProvider>
  );
}