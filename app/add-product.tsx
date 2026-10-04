import { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Save, Trash2 } from 'lucide-react-native';
import { addProducto, updateProducto, deleteProducto, getProducto } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, LabeledInput, PrimaryButton } from '@/lib/ui';

export default function AddProductScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existente = id ? getProducto(id) : undefined;
  const editando = !!existente;

  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [categoria, setCategoria] = useState(existente?.categoria ?? '');
  const [stock, setStock] = useState(existente ? String(existente.stock) : '');
  const [stockMinimo, setStockMinimo] = useState(existente ? String(existente.minimo) : '');
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = () => {
    if (!nombre.trim() || !categoria.trim() || !stock.trim()) {
      setError('Completa al menos el nombre, la categoría y el stock.');
      return;
    }
    const stockNum = parseInt(stock, 10);
    const minimoNum = parseInt(stockMinimo, 10) || 0;
    if (isNaN(stockNum) || stockNum < 0 || minimoNum < 0) {
      setError('El stock debe ser un número válido (0 o más).');
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      stock: stockNum,
      minimo: minimoNum,
    };

    if (existente) {
      updateProducto(existente.id, datos);
    } else {
      addProducto(datos);
    }
    Alert.alert(
      '¡Listo!',
      editando ? 'Producto actualizado.' : `"${datos.nombre}" se agregó al inventario.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleEliminar = () => {
    if (!existente) return;
    Alert.alert('Eliminar producto', `¿Seguro que quieres eliminar "${existente.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteProducto(existente.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <TopBar title={editando ? 'Editar Producto' : 'Nuevo Producto'} />
      <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled">
        <Text className="text-lg font-bold mb-6" style={{ color: theme.textMain }}>
          Información del producto
        </Text>

        <LabeledInput label="Nombre del producto" placeholder="Ej: Laptop HP ProBook" value={nombre} onChangeText={setNombre} />
        <LabeledInput label="Categoría" placeholder="Ej: Electrónica, Accesorios" value={categoria} onChangeText={setCategoria} />

        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <LabeledInput label="Stock actual" placeholder="0" keyboardType="numeric" value={stock} onChangeText={setStock} />
          </View>
          <View className="w-[48%]">
            <LabeledInput label="Stock mínimo" placeholder="0" keyboardType="numeric" value={stockMinimo} onChangeText={setStockMinimo} />
          </View>
        </View>

        {error && (
          <View
            className="rounded-xl px-4 py-3 mb-2 border"
            style={{ backgroundColor: theme.alertBg, borderColor: theme.alertText }}>
            <Text className="text-sm text-center font-medium" style={{ color: theme.alertText }}>{error}</Text>
          </View>
        )}

        <PrimaryButton
          label={editando ? 'Guardar cambios' : 'Guardar producto'}
          onPress={handleGuardar}
          icon={<Save size={20} color={theme.ctaText} />}
        />
        {editando && (
          <PrimaryButton
            label="Eliminar producto"
            variant="danger"
            onPress={handleEliminar}
            icon={<Trash2 size={20} color={theme.alertText} />}
          />
        )}
        <View className="h-10" />
      </ScrollView>
    </Screen>
  );
}