import { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Save, Trash2, ScanBarcode, Lock } from 'lucide-react-native';
import {
  addProducto,
  updateProducto,
  deleteProducto,
  getProducto,
  getProductoPorCodigo,
  getCategorias,
  useMisProductos,
  useMiId,
} from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, LabeledInput, PrimaryButton, Chip, IconButton } from '@/lib/ui';
import { ScannerModal } from '@/lib/Scanner';

export default function AddProductScreen() {
  const { theme } = useTheme();
  const { id, codigo: codigoParam } = useLocalSearchParams<{ id?: string; codigo?: string }>();
  const existente = id ? getProducto(id) : undefined;
  const editando = !!existente;
  const miId = useMiId();
  const misProductos = useMisProductos();
  // Solo se pueden modificar los productos propios
  const soloLectura = editando && existente.ownerId !== miId;

  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [categoria, setCategoria] = useState(existente?.categoria ?? '');
  const [codigo, setCodigo] = useState(existente?.codigo ?? codigoParam ?? '');
  const [proveedor, setProveedor] = useState(existente?.proveedor ?? '');
  const [precio, setPrecio] = useState(existente ? String(existente.precio) : '');
  const [stock, setStock] = useState(existente ? String(existente.stock) : '');
  const [stockMinimo, setStockMinimo] = useState(existente ? String(existente.minimo) : '');
  const [error, setError] = useState<string | null>(null);
  const [escaner, setEscaner] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const categoriasExistentes = getCategorias(misProductos);

  const handleGuardar = async () => {
    setError(null);
    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (nombre.trim().length > 160) {
      setError('El nombre no puede superar los 160 caracteres.');
      return;
    }
    if (!categoria.trim() || !stock.trim()) {
      setError('Completa al menos la categoría y el stock.');
      return;
    }
    const stockNum = Number(stock);
    const minimoNum = stockMinimo.trim() === '' ? 0 : Number(stockMinimo);
    const precioNum = precio.trim() === '' ? 0 : Number(precio.replace(',', '.'));
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (!Number.isInteger(minimoNum) || minimoNum < 0) {
      setError('El stock mínimo debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (Number.isNaN(precioNum) || precioNum < 0 || precioNum > 9999999999) {
      setError('Ingresa un precio válido (por ejemplo 25.50).');
      return;
    }
    const repetido = codigo.trim() !== '' ? getProductoPorCodigo(codigo) : undefined;
    if (repetido && repetido.id !== existente?.id) {
      setError(`Ese código ya lo tiene "${repetido.nombre}".`);
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      codigo: codigo.trim(),
      proveedor: proveedor.trim(),
      precio: precioNum,
      stock: stockNum,
      minimo: minimoNum,
    };

    setGuardando(true);
    const resultado = existente ? await updateProducto(existente.id, datos) : await addProducto(datos);
    setGuardando(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
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
        onPress: async () => {
          setEliminando(true);
          const resultado = await deleteProducto(existente.id);
          setEliminando(false);
          if (!resultado.ok) {
            setError(resultado.error);
            return;
          }
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <TopBar title={soloLectura ? 'Detalle del Producto' : editando ? 'Editar Producto' : 'Nuevo Producto'} />
      <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled">
        {soloLectura && (
          <View
            className="rounded-xl px-4 py-3 mb-5 border flex-row items-center"
            style={{ backgroundColor: theme.iconBg, borderColor: theme.cardBorder }}>
            <Lock size={18} color={theme.textSub} />
            <Text className="text-sm ml-3 flex-1" style={{ color: theme.textSub }}>
              Este producto es de otro usuario. Puedes verlo, pero solo su dueño puede modificarlo o eliminarlo.
            </Text>
          </View>
        )}

        <Text className="text-lg font-bold mb-6" style={{ color: theme.textMain }}>
          Información del producto
        </Text>

        <LabeledInput editable={!soloLectura} label="Nombre del producto" placeholder="Ej: Laptop HP ProBook" value={nombre} onChangeText={setNombre} />

        <LabeledInput editable={!soloLectura} label="Categoría" placeholder="Ej: Electrónica, Accesorios" value={categoria} onChangeText={setCategoria} />
        {!soloLectura && categoriasExistentes.length > 0 && (
          <View className="flex-row flex-wrap -mt-2 mb-3">
            {categoriasExistentes.map((c) => (
              <View key={c} className="mb-2">
                <Chip label={c} active={categoria.trim() === c} onPress={() => setCategoria(c)} />
              </View>
            ))}
          </View>
        )}

        <LabeledInput
          editable={!soloLectura}
          label="Código de barras"
          placeholder="Escanéalo o escríbelo"
          value={codigo}
          onChangeText={setCodigo}
          right={
            soloLectura ? undefined : (
              <IconButton label="Escanear código" onPress={() => setEscaner(true)}>
                <ScanBarcode size={22} color={theme.ctaText} />
              </IconButton>
            )
          }
        />

        <LabeledInput editable={!soloLectura} label="Proveedor" placeholder="Ej: Logitech" value={proveedor} onChangeText={setProveedor} />
        <LabeledInput editable={!soloLectura} label="Precio" placeholder="0.00" keyboardType="numeric" value={precio} onChangeText={setPrecio} />

        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <LabeledInput editable={!soloLectura} label="Stock actual" placeholder="0" keyboardType="numeric" value={stock} onChangeText={setStock} />
          </View>
          <View className="w-[48%]">
            <LabeledInput editable={!soloLectura} label="Stock mínimo" placeholder="0" keyboardType="numeric" value={stockMinimo} onChangeText={setStockMinimo} />
          </View>
        </View>

        {error && (
          <View
            className="rounded-xl px-4 py-3 mb-2 border"
            style={{ backgroundColor: theme.alertBg, borderColor: theme.alertText }}>
            <Text className="text-sm text-center font-medium" style={{ color: theme.alertText }}>{error}</Text>
          </View>
        )}

        {!soloLectura && (
          <PrimaryButton
            label={guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar producto'}
            onPress={handleGuardar}
            loading={guardando}
            icon={<Save size={20} color={theme.ctaText} />}
          />
        )}
        {editando && !soloLectura && (
          <PrimaryButton
            label={eliminando ? 'Eliminando...' : 'Eliminar producto'}
            variant="danger"
            onPress={handleEliminar}
            loading={eliminando}
            icon={<Trash2 size={20} color={theme.alertText} />}
          />
        )}
        <View className="h-10" />
      </ScrollView>

      <ScannerModal
        visible={escaner}
        onClose={() => setEscaner(false)}
        onScanned={(c) => {
          setCodigo(c);
          setEscaner(false);
        }}
      />
    </Screen>
  );
}