import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpCircle, ArrowDownCircle, Search, Check } from 'lucide-react-native';
import { useProductos, registrarMovimiento } from '@/lib/store';
import type { TipoMovimiento } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, LabeledInput, PrimaryButton } from '@/lib/ui';

export default function MovimientoScreen() {
  const { theme } = useTheme();
  const { tipo: tipoParam } = useLocalSearchParams<{ tipo?: string }>();
  const tipo: TipoMovimiento = tipoParam === 'salida' ? 'salida' : 'entrada';
  const esEntrada = tipo === 'entrada';
  const color = esEntrada ? theme.successText : theme.alertText;
  const Icon = esEntrada ? ArrowUpCircle : ArrowDownCircle;

  const productos = useProductos();
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);

  const seleccionado = productos.find((p) => p.id === seleccionadoId);
  const lista = productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const handleGuardar = () => {
    setError(null);
    if (!seleccionado) {
      setError('Selecciona un producto de la lista.');
      return;
    }
    const resultado = registrarMovimiento(seleccionado.id, tipo, parseInt(cantidad, 10), nota);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    Alert.alert('¡Registrado!', `${esEntrada ? 'Entrada' : 'Salida'} de ${cantidad} unidad(es) guardada.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <TopBar title={esEntrada ? 'Registrar Entrada' : 'Registrar Salida'} />
      <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center mb-4">
          <Icon size={22} color={color} />
          <Text className="text-lg font-bold ml-2" style={{ color: theme.textMain }}>
            1. Elige el producto
          </Text>
        </View>

        <View
          className="flex-row items-center rounded-xl border px-4 h-12 mb-3"
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

        {lista.map((p) => {
          const activo = p.id === seleccionadoId;
          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.8}
              onPress={() => setSeleccionadoId(p.id)}
              className="rounded-xl p-3 mb-2 border flex-row items-center"
              style={{
                backgroundColor: activo ? theme.iconBg : theme.cardBg,
                borderColor: activo ? color : theme.cardBorder,
              }}>
              <View className="flex-1">
                <Text className="text-sm font-bold" style={{ color: theme.textMain }}>{p.nombre}</Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>Stock actual: {p.stock}</Text>
              </View>
              {activo && <Check size={20} color={color} />}
            </TouchableOpacity>
          );
        })}
        {lista.length === 0 && (
          <Text className="text-center text-sm my-4" style={{ color: theme.textSub }}>
            No se encontraron productos.
          </Text>
        )}

        <Text className="text-lg font-bold mt-6 mb-4" style={{ color: theme.textMain }}>2. Cantidad</Text>
        <LabeledInput
          label={esEntrada ? 'Unidades que ingresan' : 'Unidades que salen'}
          placeholder="0"
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />
        <LabeledInput
          label="Nota (opcional)"
          placeholder={esEntrada ? 'Ej: Compra a proveedor' : 'Ej: Venta a cliente'}
          value={nota}
          onChangeText={setNota}
        />

        {error && (
          <View
            className="rounded-xl px-4 py-3 mb-2 border"
            style={{ backgroundColor: theme.alertBg, borderColor: theme.alertText }}>
            <Text className="text-sm text-center font-medium" style={{ color: theme.alertText }}>{error}</Text>
          </View>
        )}

        <PrimaryButton
          label={esEntrada ? 'Registrar entrada' : 'Registrar salida'}
          onPress={handleGuardar}
          icon={<Icon size={20} color={theme.ctaText} />}
        />
        <View className="h-10" />
      </ScrollView>
    </Screen>
  );
}