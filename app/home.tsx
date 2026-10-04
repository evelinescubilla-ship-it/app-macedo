 import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import {
  LogOut,
  Sun,
  Moon,
  Sunset,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  AlertTriangle,
} from 'lucide-react-native';
import { getGreeting } from '@/lib/greeting';
import { getTheme, getRandomPhrase } from '@/lib/theme';
import { getProductos } from '@/lib/store';

export default function HomeScreen() {
  const theme = getTheme();
  const greeting = getGreeting();
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 20;
  const Icon = isMorning ? Sun : isAfternoon ? Sunset : Moon;

  const [total, setTotal] = useState(0);
  const [bajo, setBajo] = useState(0);

  // Se actualiza cada vez que vuelves a esta pantalla
  useFocusEffect(
    useCallback(() => {
      const lista = getProductos();
      setTotal(lista.length);
      setBajo(lista.filter((p) => p.stock <= p.minimo).length);
    }, [])
  );

  const titleColor = theme.isDay ? 'text-[#060439]' : 'text-white';
  const subColor = theme.isDay ? 'text-[#5A47C4]' : 'text-[#A9A5F3]';

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 w-full max-w-[720px] self-center px-6 py-8">
          {/* Encabezado */}
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center border border-white/30">
                <Text className={`text-sm font-bold ${theme.isDay ? 'text-[#1016A5]' : 'text-white'}`}>I360</Text>
              </View>
              <Text className={`text-base font-bold ml-3 ${titleColor}`}>INVENTARIO360</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.replace('/')}
              className="w-10 h-10 bg-white/20 border border-white/30 rounded-xl items-center justify-center">
              <LogOut size={18} color="#FB7185" />
            </TouchableOpacity>
          </View>

          {/* Saludo */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4 border border-white/30">
              <Icon size={30} color={theme.isDay ? '#1016A5' : '#A9A5F3'} />
            </View>
            <Text className={`text-sm font-semibold mb-1 ${subColor}`}>{greeting}</Text>
            <Text className={`text-3xl font-bold text-center ${titleColor}`}>Panel de Control</Text>
          </View>

          {/* Frase */}
          <View className="bg-white/10 rounded-xl p-3 mb-6 border border-white/20">
            <Text className={`text-center text-xs font-medium ${theme.isDay ? 'text-[#1016A5]' : 'text-white'}`}>
              {getRandomPhrase()}
            </Text>
          </View>

          {/* Resumen */}
          <View className="flex-row justify-between mb-6">
            <View
              className="rounded-2xl p-4 w-[48%] border border-white/20"
              style={{ backgroundColor: theme.cardBg }}>
              <Text className={`text-xs font-bold mb-1 ${subColor}`}>TOTAL PRODUCTOS</Text>
              <Text className={`text-3xl font-bold ${titleColor}`}>{total}</Text>
            </View>
            <View
              className="rounded-2xl p-4 w-[48%] border border-white/20"
              style={{ backgroundColor: theme.alertBg }}>
              <View className="flex-row items-center mb-1">
                <AlertTriangle size={14} color={theme.alertText} />
                <Text className="text-xs font-bold ml-1" style={{ color: theme.alertText }}>
                  STOCK BAJO
                </Text>
              </View>
              <Text className="text-3xl font-bold" style={{ color: theme.alertText }}>
                {bajo}
              </Text>
            </View>
          </View>

          <Text className={`text-lg font-bold mb-4 ${titleColor}`}>Gestión de Inventario</Text>

          {/* Accesos */}
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              onPress={() => router.push('/products')}
              className="p-4 rounded-2xl w-[48%] mb-4 border border-white/20"
              style={{ backgroundColor: theme.cardBg }}>
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mb-3">
                <Package size={24} color={theme.accent} />
              </View>
              <Text className={`text-base font-bold mb-1 ${titleColor}`}>Productos</Text>
              <Text className={`text-xs ${subColor}`}>Ver y editar inventario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 rounded-2xl w-[48%] mb-4 border border-white/20"
              style={{ backgroundColor: theme.cardBg }}>
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mb-3">
                <ArrowUpCircle size={24} color={theme.accent} />
              </View>
              <Text className={`text-base font-bold mb-1 ${titleColor}`}>Entradas</Text>
              <Text className={`text-xs ${subColor}`}>Registrar mercadería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 rounded-2xl w-[48%] mb-4 border border-white/20"
              style={{ backgroundColor: theme.cardBg }}>
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mb-3">
                <ArrowDownCircle size={24} color="#FB7185" />
              </View>
              <Text className={`text-base font-bold mb-1 ${titleColor}`}>Salidas</Text>
              <Text className={`text-xs ${subColor}`}>Registrar ventas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 rounded-2xl w-[48%] mb-4 border border-white/20"
              style={{ backgroundColor: theme.cardBg }}>
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mb-3">
                <History size={24} color={theme.accent} />
              </View>
              <Text className={`text-base font-bold mb-1 ${titleColor}`}>Historial</Text>
              <Text className={`text-xs ${subColor}`}>Registro de movimientos</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}