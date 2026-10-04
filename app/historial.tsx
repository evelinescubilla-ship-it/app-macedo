import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { useMovimientos, formatFecha } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, Chip } from '@/lib/ui';

type Filtro = 'todos' | 'entrada' | 'salida';

export default function HistorialScreen() {
  const { theme } = useTheme();
  const movimientos = useMovimientos();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const lista = movimientos.filter((m) => filtro === 'todos' || m.tipo === filtro);

  return (
    <Screen>
      <TopBar title="Historial" />
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row">
          <Chip label="Todos" active={filtro === 'todos'} onPress={() => setFiltro('todos')} />
          <Chip label="Entradas" active={filtro === 'entrada'} onPress={() => setFiltro('entrada')} />
          <Chip label="Salidas" active={filtro === 'salida'} onPress={() => setFiltro('salida')} />
        </View>
        <Text className="text-sm mt-3" style={{ color: theme.textSub }}>
          {lista.length} movimientos
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {lista.map((m) => {
          const entrada = m.tipo === 'entrada';
          const color = entrada ? theme.successText : theme.alertText;
          const Icon = entrada ? ArrowUpCircle : ArrowDownCircle;
          return (
            <View
              key={m.id}
              className="rounded-2xl p-4 mt-3 border flex-row items-center"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: entrada ? theme.successBg : theme.alertBg }}>
                <Icon size={22} color={color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: theme.textMain }}>{m.productoNombre}</Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>{formatFecha(m.fecha)}</Text>
                {m.nota !== '' && (
                  <Text className="text-xs mt-1" style={{ color: theme.textSub }}>{m.nota}</Text>
                )}
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold" style={{ color }}>
                  {entrada ? '+' : '-'}{m.cantidad}
                </Text>
                <Text className="text-xs" style={{ color: theme.textSub }}>stock: {m.stockResultante}</Text>
              </View>
            </View>
          );
        })}

        {lista.length === 0 && (
          <Text className="text-center text-sm mt-10" style={{ color: theme.textSub }}>
            Todavía no hay movimientos. Registra una entrada o una salida desde el panel.
          </Text>
        )}
        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}