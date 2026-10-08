import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
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
  BarChart3,
  ScanBarcode,
  CheckCircle2,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { getGreeting } from '@/lib/greeting';
import { getRandomPhrase } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useMisProductos, useMovimientos, useUsuario, useEstado, cerrarSesion, cargarProductos } from '@/lib/store';
import { Screen, ThemeToggle, iconButtonStyle, ErrorBanner } from '@/lib/ui';
import { ScannerModal } from '@/lib/Scanner';
import { procesarCodigo } from '@/lib/scan';

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}

function ModuleCard({ title, subtitle, icon: Icon, color, onPress }: ModuleCardProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="p-4 rounded-2xl w-[48%] mb-4 border"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: theme.iconBg }}>
        <Icon size={24} color={color} />
      </View>
      <Text className="text-base font-bold mb-1" style={{ color: theme.textMain }}>{title}</Text>
      <Text className="text-xs" style={{ color: theme.textSub }}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const productos = useMisProductos();
  const estado = useEstado();
  const movimientos = useMovimientos();
  const usuario = useUsuario();
  const [frase] = useState(getRandomPhrase);
  const [escaner, setEscaner] = useState(false);

  const total = productos.length;
  // Los más urgentes primero (los que están más por debajo de su mínimo)
  const aReponer = productos
    .filter((p) => p.stock <= p.minimo)
    .sort((a, b) => a.stock - a.minimo - (b.stock - b.minimo));
  const bajo = aReponer.length;

  const hour = new Date().getHours();
  const Icon = hour >= 5 && hour < 12 ? Sun : hour < 20 && hour >= 12 ? Sunset : Moon;

  const ir = (href: Href) => router.push(href);
  const reponer = (productoId: string) =>
    router.push({ pathname: '/movimiento', params: { tipo: 'entrada', productoId } } as unknown as Href);

  return (
    <Screen>
      <ScrollView
        className="flex-1 w-full max-w-[720px] self-center px-6 py-6"
        refreshControl={
          <RefreshControl refreshing={estado.cargando} onRefresh={cargarProductos} tintColor={theme.accent} />
        }>
        {/* Encabezado */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center border"
              style={{ backgroundColor: theme.iconBg, borderColor: theme.cardBorder }}>
              <Text className="text-sm font-bold" style={{ color: theme.accent }}>I360</Text>
            </View>
            <Text className="text-base font-bold ml-3" style={{ color: theme.textMain }}>INVENTARIO360</Text>
          </View>
          <View className="flex-row items-center">
            <ThemeToggle />
            <TouchableOpacity
              onPress={async () => {
                await cerrarSesion();
                router.replace('/');
              }}
              className="ml-2"
              style={iconButtonStyle(theme)}>
              <LogOut size={18} color={theme.alertText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Saludo */}
        <View className="items-center mb-8">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-4 border"
            style={{ backgroundColor: theme.iconBg, borderColor: theme.cardBorder }}>
            <Icon size={30} color={theme.accent} />
          </View>
          <Text className="text-sm font-semibold mb-1" style={{ color: theme.textSub }}>
            {getGreeting()}, {usuario}
          </Text>
          <Text className="text-3xl font-bold text-center" style={{ color: theme.textMain }}>Panel de Control</Text>
        </View>

        {/* Frase */}
        <View
          className="rounded-xl p-3 mb-6 border"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <Text className="text-center text-xs font-medium" style={{ color: theme.textSub }}>{frase}</Text>
        </View>

        {estado.error && <ErrorBanner mensaje={estado.error} onRetry={cargarProductos} />}

        {/* Resumen */}
        <View className="flex-row justify-between mb-6">
          <View
            className="rounded-2xl p-4 w-[48%] border"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <Text className="text-xs font-bold mb-1" style={{ color: theme.textSub }}>TOTAL PRODUCTOS</Text>
            <Text className="text-3xl font-bold" style={{ color: theme.textMain }}>{total}</Text>
          </View>
          <View
            className="rounded-2xl p-4 w-[48%] border"
            style={{ backgroundColor: theme.alertBg, borderColor: theme.alertText }}>
            <View className="flex-row items-center mb-1">
              <AlertTriangle size={14} color={theme.alertText} />
              <Text className="text-xs font-bold ml-1" style={{ color: theme.alertText }}>STOCK BAJO</Text>
            </View>
            <Text className="text-3xl font-bold" style={{ color: theme.alertText }}>{bajo}</Text>
          </View>
        </View>

        {/* Productos por reponer */}
        <Text className="text-lg font-bold mb-3" style={{ color: theme.textMain }}>Por reponer</Text>
        {bajo === 0 ? (
          <View
            className="rounded-2xl p-4 mb-6 border flex-row items-center"
            style={{ backgroundColor: theme.successBg, borderColor: theme.successText }}>
            <CheckCircle2 size={20} color={theme.successText} />
            <Text className="text-sm font-semibold ml-3 flex-1" style={{ color: theme.successText }}>
              {total === 0
                ? 'Aún no tienes productos. Agrega el primero desde Productos.'
                : 'Todo el stock está en orden. No hay nada para reponer.'}
            </Text>
          </View>
        ) : (
          <View className="mb-6">
            {aReponer.slice(0, 5).map((p) => (
              <View
                key={p.id}
                className="rounded-2xl p-3 mb-2 border flex-row items-center"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.alertText }}>
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: theme.alertBg }}>
                  <AlertTriangle size={18} color={theme.alertText} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold" style={{ color: theme.textMain }} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.alertText }}>
                    Quedan {p.stock} · mínimo {p.minimo}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => reponer(p.id)}
                  className="px-3 py-2 rounded-lg"
                  style={{ backgroundColor: theme.ctaBg }}>
                  <Text className="text-xs font-bold" style={{ color: theme.ctaText }}>Reponer</Text>
                </TouchableOpacity>
              </View>
            ))}
            {aReponer.length > 5 && (
              <Text className="text-xs text-center mt-1" style={{ color: theme.textSub }}>
                y {aReponer.length - 5} más · míralos en Productos con el filtro "Stock bajo"
              </Text>
            )}
          </View>
        )}

        <Text className="text-lg font-bold mb-4" style={{ color: theme.textMain }}>Gestión de Inventario</Text>

        {/* Módulos */}
        <View className="flex-row flex-wrap justify-between">
          <ModuleCard
            title="Productos"
            subtitle="Ver y editar inventario"
            icon={Package}
            color={theme.accent}
            onPress={() => ir('/products' as Href)}
          />
          <ModuleCard
            title="Entradas"
            subtitle="Registrar mercadería"
            icon={ArrowUpCircle}
            color={theme.successText}
            onPress={() => ir({ pathname: '/movimiento', params: { tipo: 'entrada' } } as unknown as Href)}
          />
          <ModuleCard
            title="Salidas"
            subtitle="Registrar ventas"
            icon={ArrowDownCircle}
            color={theme.alertText}
            onPress={() => ir({ pathname: '/movimiento', params: { tipo: 'salida' } } as unknown as Href)}
          />
          <ModuleCard
            title="Historial"
            subtitle={`${movimientos.length} movimientos`}
            icon={History}
            color={theme.accent}
            onPress={() => ir('/historial' as Href)}
          />
          <ModuleCard
            title="Reportes"
            subtitle="Gráficos y totales"
            icon={BarChart3}
            color={theme.accent}
            onPress={() => ir('/reportes' as Href)}
          />
          <ModuleCard
            title="Escáner"
            subtitle="Buscar por código"
            icon={ScanBarcode}
            color={theme.accent}
            onPress={() => setEscaner(true)}
          />
        </View>
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