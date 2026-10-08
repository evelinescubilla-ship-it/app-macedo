 // lib/ui.tsx
// Componentes compartidos (estilos con "style" para que sigan el tema claro/oscuro)

import { ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardTypeOptions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Sun, Moon } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import type { AppTheme } from './theme';

export const iconButtonStyle = (theme: AppTheme) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: theme.iconBg,
  borderWidth: 1,
  borderColor: theme.cardBorder,
});

export function Screen({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

// Botón sol / luna para cambiar entre modo claro y oscuro
export function ThemeToggle() {
  const { theme, mode, toggleMode } = useTheme();
  const Icon = mode === 'dark' ? Sun : Moon;
  return (
    <TouchableOpacity
      onPress={toggleMode}
      accessibilityLabel="Cambiar modo claro u oscuro"
      style={iconButtonStyle(theme)}>
      <Icon size={18} color={theme.accent} />
    </TouchableOpacity>
  );
}

export function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: theme.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
      }}>
      <TouchableOpacity onPress={() => router.back()} style={iconButtonStyle(theme)}>
        <ArrowLeft size={20} color={theme.textMain} />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textMain }}>{title}</Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right ?? <ThemeToggle />}</View>
    </View>
  );
}

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  right?: ReactNode;
  editable?: boolean;
}

export function LabeledInput({ label, value, onChangeText, placeholder, keyboardType, right, editable = true }: LabeledInputProps) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.textMain }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={{
            flex: 1,
            height: 56,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            paddingHorizontal: 16,
            fontSize: 15,
            backgroundColor: theme.inputBg,
            color: theme.inputText,
            opacity: editable ? 1 : 0.6,
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
        />
        {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
      </View>
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'danger';
  loading?: boolean;
}

export function PrimaryButton({ label, onPress, icon, variant = 'primary', loading = false }: ButtonProps) {
  const { theme } = useTheme();
  const danger = variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      style={{
        opacity: loading ? 0.7 : 1,
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        backgroundColor: danger ? theme.alertBg : theme.ctaBg,
        borderWidth: danger ? 1 : 0,
        borderColor: theme.alertText,
      }}>
      {loading ? <ActivityIndicator color={danger ? theme.alertText : theme.ctaText} style={{ marginRight: 8 }} /> : icon}
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          marginLeft: icon && !loading ? 8 : 0,
          color: danger ? theme.alertText : theme.ctaText,
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
        borderColor: active ? theme.ctaBg : theme.cardBorder,
        backgroundColor: active ? theme.ctaBg : theme.cardBg,
      }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? theme.ctaText : theme.textMain }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Botón cuadrado con ícono (para escanear, etc.)
export function IconButton({ children, onPress, label }: { children: ReactNode; onPress: () => void; label: string }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.ctaBg,
      }}>
      {children}
    </TouchableOpacity>
  );
}

// Barra horizontal para los gráficos de los reportes
interface BarRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
  valueLabel?: string;
}

export function BarRow({ label, value, max, color, valueLabel }: BarRowProps) {
  const { theme } = useTheme();
  const porcentaje = max > 0 ? Math.max(value / max, value > 0 ? 0.03 : 0) * 100 : 0;
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, fontWeight: '600', color: theme.textMain }}>
          {label}
        </Text>
        <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '700', color: theme.textSub }}>
          {valueLabel ?? String(value)}
        </Text>
      </View>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.iconBg, overflow: 'hidden' }}>
        <View style={{ width: `${porcentaje}%`, height: '100%', borderRadius: 5, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Aviso de error (por ejemplo, cuando falla la conexión) con botón para reintentar
export function ErrorBanner({ mensaje, onRetry }: { mensaje: string; onRetry?: () => void }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.alertText,
        backgroundColor: theme.alertBg,
      }}>
      <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: theme.alertText }}>{mensaje}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{ marginLeft: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.alertText }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}