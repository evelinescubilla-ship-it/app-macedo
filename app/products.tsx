import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft, Plus, Package, AlertTriangle, Search } from 'lucide-react-native';
import { getProductos } from '@/lib/store';
import type { Producto } from '@/lib/store';
import { getTheme } from '@/lib/theme';

export default function ProductsScreen() {
  const theme = getTheme();
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);

  // Recarga la lista cada vez que vuelves a esta pantalla
  useFocusEffect(
    useCallback(() => {
      setProductos(getProductos());
    }, [])
  );

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const titleColor = theme.isDay ? 'text-[#060439]' : 'text-white';
  const subColor = theme.isDay ? 'text-[#5A47C4]' : 'text-[#A9A5F3]';

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        {/* Barra superior */}
        <View
          className="flex-row items-center justify-between px-6 py-4 border-b border-white/20"
          style={{ backgroundColor: theme.cardBg }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
            <ArrowLeft size={20} color={theme.textMain} />
          </TouchableOpacity>
          <Text className={`text-lg font-bold ${titleColor}`}>Productos</Text>
          <TouchableOpacity
            onPress={() => router.push('/add-product')}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.ctaBg }}>
            <Plus size={20} color={theme.ctaText} />
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View className="px-6 py-4">
          <View
            className="flex-row items-center rounded-xl border border-white/30 px-4 h-12"
            style={{ backgroundColor: theme.inputBg }}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-sm"
              style={{ color: theme.textMain }}
              placeholder="Buscar producto..."
              placeholderTextColor="#94A3B8"
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </View>

        {/* Contador */}
        <View className="px-6 mb-4">
          <Text className={`text-sm ${subColor}`}>
            Mostrando{' '}
            <Text className="font-bold" style={{ color: theme.accent }}>
              {productosFiltrados.length}
            </Text>{' '}
            productos
          </Text>
        </View>

        {/* Lista */}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {productosFiltrados.map((item) => {
            const stockBajo = item.stock <= item.minimo;
            return (
              <View
                key={item.id}
                className="rounded-2xl p-4 mb-3 border border-white/20 flex-row items-center"
                style={{ backgroundColor: theme.cardBg }}>
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${stockBajo ? 'bg-red-500/20' : 'bg-white/20'}`}>
                  {stockBajo ? (
                    <AlertTriangle size={22} color={theme.alertText} />
                  ) : (
                    <Package size={22} color={theme.accent} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-bold ${titleColor}`}>{item.nombre}</Text>
                  <Text className={`text-xs ${subColor}`}>{item.categoria}</Text>
                </View>
                <View className="items-end">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: stockBajo ? theme.alertText : theme.accent }}>
                    {item.stock}
                  </Text>
                  <Text className={`text-xs ${subColor}`}>unidades</Text>
                </View>
              </View>
            );
          })}

          {productosFiltrados.length === 0 && (
            <Text className={`text-center text-sm mt-8 ${subColor}`}>
              No se encontraron productos.
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}