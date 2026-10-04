// lib/ui.tsx
// Componentes compartidos (estilos con "style" para que sigan el tema claro/oscuro)

import { ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardTypeOptions } from 'react-native';
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
}

export function LabeledInput({ label, value, onChangeText, placeholder, keyboardType }: LabeledInputProps) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.textMain }}>{label}</Text>
      <TextInput
        style={{
          height: 56,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          paddingHorizontal: 16,
          fontSize: 15,
          backgroundColor: theme.inputBg,
          color: theme.inputText,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'danger';
}

export function PrimaryButton({ label, onPress, icon, variant = 'primary' }: ButtonProps) {
  const { theme } = useTheme();
  const danger = variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
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
      {icon}
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          marginLeft: icon ? 8 : 0,
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