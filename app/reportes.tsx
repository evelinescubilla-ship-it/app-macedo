import { ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useMisProductos, useMovimientos, getCategorias, formatPrecio } from '@/lib/store';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, TopBar, BarRow } from '@/lib/ui';

function Card({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View
      className="rounded-2xl p-4 mb-4 border"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <Text className="text-base font-bold mb-4" style={{ color: theme.textMain }}>{title}</Text>
      {children}
    </View>
  );
}

function Kpi({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  const { theme } = useTheme();
  return (
    <View
      className="rounded-2xl p-4 w-[48%] mb-4 border"
      style={{
        backgroundColor: danger ? theme.alertBg : theme.cardBg,
        borderColor: danger ? theme.alertText : theme.cardBorder,
      }}>
      <Text className="text-xs font-bold mb-1" style={{ color: danger ? theme.alertText : theme.textSub }}>
        {label}
      </Text>
      <Text className="text-xl font-bold" style={{ color: danger ? theme.alertText : theme.textMain }}>
        {value}
      </Text>
    </View>
  );
}

function Vacio({ texto }: { texto: string }) {
  const { theme } = useTheme();
  return <Text className="text-sm text-center py-2" style={{ color: theme.textSub }}>{texto}</Text>;
}

export default function ReportesScreen() {
  const { theme } = useTheme();
  const productos = useMisProductos();
  const movimientos = useMovimientos();

  // Totales
  const valorTotal = productos.reduce((acc, p) => acc + p.precio * p.stock, 0);
  const unidades = productos.reduce((acc, p) => acc + p.stock, 0);
  const bajo = productos.filter((p) => p.stock <= p.minimo).length;

  // Entradas vs salidas
  const entradas = movimientos.filter((m) => m.tipo === 'entrada').reduce((acc, m) => acc + m.cantidad, 0);
  const salidas = movimientos.filter((m) => m.tipo === 'salida').reduce((acc, m) => acc + m.cantidad, 0);
  const maxMov = Math.max(entradas, salidas, 1);

  // Por categoría
  const categorias = getCategorias(productos).map((nombre) => {
    const delGrupo = productos.filter((p) => p.categoria.trim() === nombre);
    return {
      nombre,
      unidades: delGrupo.reduce((acc, p) => acc + p.stock, 0),
      valor: delGrupo.reduce((acc, p) => acc + p.stock * p.precio, 0),
    };
  });
  const maxUnidades = Math.max(...categorias.map((c) => c.unidades), 1);
  const maxValor = Math.max(...categorias.map((c) => c.valor), 1);

  // Productos más movidos
  const porProducto: Record<string, { nombre: string; total: number }> = {};
  movimientos.forEach((m) => {
    const actual = porProducto[m.productoId];
    porProducto[m.productoId] = {
      nombre: m.productoNombre,
      total: (actual?.total ?? 0) + m.cantidad,
    };
  });
  const masMovidos = Object.values(porProducto)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxMovido = Math.max(...masMovidos.map((p) => p.total), 1);

  // Movimientos por usuario
  const porUsuario: Record<string, number> = {};
  movimientos.forEach((m) => {
    porUsuario[m.usuario] = (porUsuario[m.usuario] ?? 0) + 1;
  });
  const usuarios = Object.entries(porUsuario).sort((a, b) => b[1] - a[1]);
  const maxUsuario = Math.max(...usuarios.map((u) => u[1]), 1);

  return (
    <Screen>
      <TopBar title="Reportes" />
      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
          <Kpi label="VALOR DEL INVENTARIO" value={formatPrecio(valorTotal)} />
          <Kpi label="UNIDADES EN STOCK" value={String(unidades)} />
          <Kpi label="PRODUCTOS" value={String(productos.length)} />
          <Kpi label="STOCK BAJO" value={String(bajo)} danger={bajo > 0} />
        </View>

        <Card title="Entradas vs. salidas (unidades)">
          <BarRow label="Entradas" value={entradas} max={maxMov} color={theme.successText} />
          <BarRow label="Salidas" value={salidas} max={maxMov} color={theme.alertText} />
          {movimientos.length === 0 && <Vacio texto="Aún no hay movimientos registrados." />}
        </Card>

        <Card title="Stock por categoría (unidades)">
          {categorias.map((c) => (
            <BarRow key={c.nombre} label={c.nombre} value={c.unidades} max={maxUnidades} color={theme.accent} />
          ))}
          {categorias.length === 0 && <Vacio texto="No hay productos." />}
        </Card>

        <Card title="Valor por categoría">
          {categorias.map((c) => (
            <BarRow
              key={c.nombre}
              label={c.nombre}
              value={c.valor}
              max={maxValor}
              color={theme.ctaBg}
              valueLabel={formatPrecio(c.valor)}
            />
          ))}
          {categorias.length === 0 && <Vacio texto="No hay productos." />}
        </Card>

        <Card title="Productos más movidos">
          {masMovidos.map((p) => (
            <BarRow key={p.nombre} label={p.nombre} value={p.total} max={maxMovido} color={theme.accent} />
          ))}
          {masMovidos.length === 0 && <Vacio texto="Registra entradas o salidas para ver este ranking." />}
        </Card>

        <Card title="Movimientos por usuario">
          {usuarios.map(([nombre, cantidad]) => (
            <BarRow key={nombre} label={nombre} value={cantidad} max={maxUsuario} color={theme.ctaBg} />
          ))}
          {usuarios.length === 0 && <Vacio texto="Todavía no hay movimientos." />}
        </Card>

        <View className="h-10" />
      </ScrollView>
    </Screen>
  );
}