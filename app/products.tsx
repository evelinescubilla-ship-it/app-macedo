import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Plus, Package, AlertTriangle, Search, ChevronRight } from 'lucide-react-native';
import { useProductos } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, Chip } from '@/lib/ui';

export default function ProductsScreen() {
  const { theme } = useTheme();
  const productos = useProductos();
  const [busqueda, setBusqueda] = useState('');
  const [soloBajo, setSoloBajo] = useState(false);

  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (!soloBajo || p.stock <= p.minimo)
  );

  return (
    <Screen>
      <TopBar
        title="Productos"
        right={
          <TouchableOpacity
            onPress={() => router.push('/add-product')}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.ctaBg }}>
            <Plus size={20} color={theme.ctaText} />
          </TouchableOpacity>
        }
      />

      <View className="px-6 pt-4">
        <View
          className="flex-row items-center rounded-xl border px-4 h-12"
          style={{ backgroundColor: theme.inputBg, borderColor: theme.cardBorder }}>
          <Search size={18} color={theme.inputIcon} />
          <TextInput
            className="flex-1 ml-3 text-sm"
            style={{ color: theme.inputText }}
            placeholder="Buscar producto..."
            placeholderTextColor={theme.placeholder}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
        <View className="flex-row mt-3">
          <Chip label="Todos" active={!soloBajo} onPress={() => setSoloBajo(false)} />
          <Chip label="Stock bajo" active={soloBajo} onPress={() => setSoloBajo(true)} />
        </View>
        <Text className="text-sm my-3" style={{ color: theme.textSub }}>
          Mostrando {filtrados.length} productos · toca uno para editarlo
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filtrados.map((item) => {
          const bajo = item.stock <= item.minimo;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/add-product', params: { id: item.id } })}
              className="rounded-2xl p-4 mb-3 border flex-row items-center"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: bajo ? theme.alertText : theme.cardBorder,
              }}>
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: bajo ? theme.alertBg : theme.iconBg }}>
                {bajo ? (
                  <AlertTriangle size={22} color={theme.alertText} />
                ) : (
                  <Package size={22} color={theme.accent} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: theme.textMain }}>{item.nombre}</Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>
                  {item.categoria} · mínimo {item.minimo}
                </Text>
              </View>
              <View className="items-end mr-2">
                <Text className="text-lg font-bold" style={{ color: bajo ? theme.alertText : theme.accent }}>
                  {item.stock}
                </Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>unidades</Text>
              </View>
              <ChevronRight size={18} color={theme.textSub} />
            </TouchableOpacity>
          );
        })}

        {filtrados.length === 0 && (
          <Text className="text-center text-sm mt-8" style={{ color: theme.textSub }}>
            No se encontraron productos.
          </Text>
        )}
        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}