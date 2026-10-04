import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { addProducto } from '@/lib/store';
import { getTheme } from '@/lib/theme';

export default function AddProductScreen() {
  const theme = getTheme();
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');

  const titleColor = theme.isDay ? 'text-[#060439]' : 'text-white';

  const handleGuardar = () => {
    if (!nombre.trim() || !categoria.trim() || !stock.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa al menos el nombre, la categoría y el stock.');
      return;
    }

    addProducto({
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      stock: parseInt(stock, 10) || 0,
      minimo: parseInt(stockMinimo, 10) || 0,
    });

    Alert.alert('¡Éxito!', `El producto "${nombre.trim()}" se ha agregado al inventario.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

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
          <Text className={`text-lg font-bold ${titleColor}`}>Nuevo Producto</Text>
          <TouchableOpacity
            onPress={handleGuardar}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.ctaBg }}>
            <Save size={20} color={theme.ctaText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 py-6"
          keyboardShouldPersistTaps="handled">
          <Text className={`text-lg font-bold mb-6 ${titleColor}`}>Información del producto</Text>

          <View className="mb-4">
            <Text className={`text-sm font-semibold mb-2 ${titleColor}`}>Nombre del producto</Text>
            <TextInput
              className="rounded-xl border border-white/30 px-4 h-14 text-[15px]"
              style={{ backgroundColor: theme.inputBg, color: theme.textMain }}
              placeholder="Ej: Laptop HP ProBook"
              placeholderTextColor="#94A3B8"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View className="mb-4">
            <Text className={`text-sm font-semibold mb-2 ${titleColor}`}>Categoría</Text>
            <TextInput
              className="rounded-xl border border-white/30 px-4 h-14 text-[15px]"
              style={{ backgroundColor: theme.inputBg, color: theme.textMain }}
              placeholder="Ej: Electrónica, Accesorios"
              placeholderTextColor="#94A3B8"
              value={categoria}
              onChangeText={setCategoria}
            />
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="w-[48%]">
              <Text className={`text-sm font-semibold mb-2 ${titleColor}`}>Stock actual</Text>
              <TextInput
                className="rounded-xl border border-white/30 px-4 h-14 text-[15px]"
                style={{ backgroundColor: theme.inputBg, color: theme.textMain }}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
            <View className="w-[48%]">
              <Text className={`text-sm font-semibold mb-2 ${titleColor}`}>Stock mínimo</Text>
              <TextInput
                className="rounded-xl border border-white/30 px-4 h-14 text-[15px]"
                style={{ backgroundColor: theme.inputBg, color: theme.textMain }}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={stockMinimo}
                onChangeText={setStockMinimo}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleGuardar}
            className="rounded-xl h-14 items-center justify-center mt-6 flex-row shadow-lg"
            style={{ backgroundColor: theme.ctaBg }}>
            <Save size={20} color={theme.ctaText} />
            <Text className="text-base font-bold ml-2" style={{ color: theme.ctaText }}>
              Guardar Producto
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}