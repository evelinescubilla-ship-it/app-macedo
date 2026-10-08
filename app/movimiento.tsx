import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpCircle, ArrowDownCircle, Search, Check, ScanBarcode } from 'lucide-react-native';
import { useMisProductos, useUsuario, registrarMovimiento, getProductoPorCodigo } from '@/lib/store';
import type { TipoMovimiento } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, LabeledInput, PrimaryButton } from '@/lib/ui';
import { ScannerModal } from '@/lib/Scanner';

export default function MovimientoScreen() {
  const { theme } = useTheme();
  const { tipo: tipoParam, productoId } = useLocalSearchParams<{ tipo?: string; productoId?: string }>();
  const tipo: TipoMovimiento = tipoParam === 'salida' ? 'salida' : 'entrada';
  const esEntrada = tipo === 'entrada';
  const color = esEntrada ? theme.successText : theme.alertText;
  const Icon = esEntrada ? ArrowUpCircle : ArrowDownCircle;

  const productos = useMisProductos();
  const usuario = useUsuario();
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(productoId ?? null);
  const [cantidad, setCantidad] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [escaner, setEscaner] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const seleccionado = productos.find((p) => p.id === seleccionadoId);
  const texto = busqueda.toLowerCase();
  const lista = productos.filter(
    (p) => p.nombre.toLowerCase().includes(texto) || p.codigo.toLowerCase().includes(texto)
  );

  const handleCodigo = (codigo: string) => {
    setEscaner(false);
    const encontrado = getProductoPorCodigo(codigo);
    if (encontrado) {
      setSeleccionadoId(encontrado.id);
      setError(null);
    } else {
      setError(`No hay ningún producto con el código ${codigo}.`);
    }
  };

  const handleGuardar = async () => {
    setError(null);
    if (!seleccionado) {
      setError('Selecciona un producto de la lista.');
      return;
    }
    setGuardando(true);
    const resultado = await registrarMovimiento(seleccionado.id, tipo, parseInt(cantidad, 10), nota);
    setGuardando(false);
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

        <View className="flex-row items-center mb-3">
          <View
            className="flex-1 flex-row items-center rounded-xl border px-4 h-12"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.cardBorder }}>
            <Search size={18} color={theme.inputIcon} />
            <TextInput
              className="flex-1 ml-3 text-sm"
              style={{ color: theme.inputText }}
              placeholder="Nombre o código..."
              placeholderTextColor={theme.placeholder}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
          <TouchableOpacity
            onPress={() => setEscaner(true)}
            accessibilityLabel="Escanear código"
            className="ml-2 w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.ctaBg }}>
            <ScanBarcode size={22} color={theme.ctaText} />
          </TouchableOpacity>
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
                <Text className="text-xs" style={{ color: theme.textSub }}>
                  Stock actual: {p.stock}{p.codigo ? ` · Cód. ${p.codigo}` : ''}
                </Text>
              </View>
              {activo && <Check size={20} color={color} />}
            </TouchableOpacity>
          );
        })}
        {lista.length === 0 && (
          <Text className="text-center text-sm my-4" style={{ color: theme.textSub }}>
            {productos.length === 0
              ? 'Todavía no tienes productos. Crea el primero desde Productos.'
              : 'No se encontraron productos.'}
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

        <Text className="text-xs mb-3" style={{ color: theme.textSub }}>
          Este movimiento quedará registrado a nombre de {usuario}.
        </Text>

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
          loading={guardando}
          icon={<Icon size={20} color={theme.ctaText} />}
        />
        <View className="h-10" />
      </ScrollView>

      <ScannerModal visible={escaner} onClose={() => setEscaner(false)} onScanned={handleCodigo} />
    </Screen>
  );
}