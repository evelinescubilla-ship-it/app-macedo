import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus, Package, AlertTriangle, Search, ChevronRight, ScanBarcode, Users } from 'lucide-react-native';
import { useProductos, useMiId, useEstado, getCategorias, formatPrecio, cargarProductos } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, Chip, ErrorBanner } from '@/lib/ui';
import { ScannerModal } from '@/lib/Scanner';
import { procesarCodigo } from '@/lib/scan';

type Orden = 'nombre' | 'stock' | 'categoria';

export default function ProductsScreen() {
  const { theme } = useTheme();
  const todos = useProductos();
  const miId = useMiId();
  const estado = useEstado();
  const [busqueda, setBusqueda] = useState('');
  const [soloMios, setSoloMios] = useState(true);
  const [soloBajo, setSoloBajo] = useState(false);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>('nombre');
  const [escaner, setEscaner] = useState(false);

  const productos = soloMios ? todos.filter((p) => p.ownerId === miId) : todos;
  const categorias = getCategorias(productos);
  const texto = busqueda.toLowerCase();

  const filtrados = productos
    .filter(
      (p) =>
        (p.nombre.toLowerCase().includes(texto) ||
          p.codigo.toLowerCase().includes(texto) ||
          p.proveedor.toLowerCase().includes(texto)) &&
        (!soloBajo || p.stock <= p.minimo) &&
        (categoria === null || p.categoria === categoria)
    )
    .sort((a, b) => {
      if (orden === 'stock') return a.stock - b.stock;
      if (orden === 'categoria') return a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre);
      return a.nombre.localeCompare(b.nombre);
    });

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
        {/* Buscador + escáner */}
        <View className="flex-row items-center">
          <View
            className="flex-1 flex-row items-center rounded-xl border px-4 h-12"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.cardBorder }}>
            <Search size={18} color={theme.inputIcon} />
            <TextInput
              className="flex-1 ml-3 text-sm"
              style={{ color: theme.inputText }}
              placeholder="Nombre, código o proveedor..."
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

        {/* De quién son los productos */}
        <View className="flex-row mt-3">
          <Chip label="Mis productos" active={soloMios} onPress={() => { setSoloMios(true); setCategoria(null); }} />
          <Chip label="De todos" active={!soloMios} onPress={() => { setSoloMios(false); setCategoria(null); }} />
        </View>

        {/* Filtro por categoría */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <Chip label="Todas" active={categoria === null} onPress={() => setCategoria(null)} />
          {categorias.map((c) => (
            <Chip key={c} label={c} active={categoria === c} onPress={() => setCategoria(c)} />
          ))}
        </ScrollView>

        {/* Orden y stock bajo */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <Text className="text-xs font-semibold mr-2 self-center" style={{ color: theme.textSub }}>
            Ordenar:
          </Text>
          <Chip label="Nombre" active={orden === 'nombre'} onPress={() => setOrden('nombre')} />
          <Chip label="Stock" active={orden === 'stock'} onPress={() => setOrden('stock')} />
          <Chip label="Categoría" active={orden === 'categoria'} onPress={() => setOrden('categoria')} />
          <Chip label="Solo stock bajo" active={soloBajo} onPress={() => setSoloBajo(!soloBajo)} />
        </ScrollView>

        <Text className="text-sm my-3" style={{ color: theme.textSub }}>
          Mostrando {filtrados.length} de {productos.length} productos
        </Text>
        {estado.error && <ErrorBanner mensaje={estado.error} onRetry={cargarProductos} />}
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={estado.cargando} onRefresh={cargarProductos} tintColor={theme.accent} />}>
        {filtrados.map((item) => {
          const esMio = item.ownerId === miId;
          const bajo = esMio && item.stock <= item.minimo;
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
                ) : esMio ? (
                  <Package size={22} color={theme.accent} />
                ) : (
                  <Users size={22} color={theme.textSub} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: theme.textMain }}>{item.nombre}</Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>
                  {item.categoria}{item.proveedor ? ` · ${item.proveedor}` : ''}
                </Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>
                  {item.codigo ? `Cód. ${item.codigo} · ` : ''}{formatPrecio(item.precio)}
                  {!esMio ? ' · de otro usuario' : ''}
                </Text>
              </View>
              <View className="items-end mr-2">
                <Text className="text-lg font-bold" style={{ color: bajo ? theme.alertText : theme.accent }}>
                  {item.stock}
                </Text>
                {esMio && <Text className="text-xs" style={{ color: theme.textSub }}>mín. {item.minimo}</Text>}
              </View>
              <ChevronRight size={18} color={theme.textSub} />
            </TouchableOpacity>
          );
        })}

        {filtrados.length === 0 && !estado.cargando && (
          <Text className="text-center text-sm mt-8" style={{ color: theme.textSub }}>
            {productos.length === 0
              ? soloMios
                ? 'Aún no tienes productos. Toca el botón + para agregar el primero.'
                : 'No hay productos en el servidor todavía.'
              : 'No se encontraron productos con esos filtros.'}
          </Text>
        )}
        <View className="h-20" />
      </ScrollView>

      <ScannerModal
        visible={escaner}
        onClose={() => setEscaner(false)}
        onScanned={(codigo) => {
          setEscaner(false);
          procesarCodigo(codigo);
        }}
      />
    </Screen>
  );
}