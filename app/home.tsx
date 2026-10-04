 import { useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  KeyboardTypeOptions,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { getRandomPhrase } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Screen, ThemeToggle, PrimaryButton } from '@/lib/ui';

// Formato válido: algo@dominio.com (sin espacios, con @ y un punto después)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldProps {
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  right?: ReactNode;
}

function Field({ icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, right }: FieldProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      className="flex-row items-center rounded-xl border px-4 h-14 mb-4"
      style={{
        backgroundColor: theme.inputBg,
        borderColor: focused ? theme.accent : theme.cardBorder,
      }}>
      <Icon size={18} color={theme.inputIcon} />
      <TextInput
        className="flex-1 ml-3 text-[15px] font-medium"
        style={{ color: theme.inputText }}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {right}
    </View>
  );
}

export default function AuthScreen() {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frase] = useState(getRandomPhrase);

  function handleSubmit() {
    setError(null);
    const hayVacios = isLogin
      ? !email.trim() || !password
      : !nombre.trim() || !email.trim() || !password || !confirmPassword;

    if (hayVacios) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un correo válido, por ejemplo: nombre@correo.com');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    router.replace('/home');
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row justify-end px-6 pt-2">
          <ThemeToggle />
        </View>
        <ScrollView contentContainerClassName="flex-grow justify-center" keyboardShouldPersistTaps="handled">
          <View className="w-full max-w-[400px] self-center px-6 py-4">
            {/* Header */}
            <View className="items-center mb-8">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-4 border"
                style={{ backgroundColor: theme.iconBg, borderColor: theme.cardBorder }}>
                <Text className="text-2xl font-bold" style={{ color: theme.accent }}>I360</Text>
              </View>
              <Text className="text-3xl font-bold mb-1" style={{ color: theme.textMain }}>Bienvenido</Text>
              <Text className="text-sm font-medium" style={{ color: theme.textSub }}>
                {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta en Inventario360'}
              </Text>
            </View>

            {/* Frase */}
            <View
              className="rounded-xl p-3 mb-6 border"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <Text className="text-center text-xs font-medium" style={{ color: theme.textSub }}>{frase}</Text>
            </View>

            {!isLogin && <Field icon={User} placeholder="Tu nombre" value={nombre} onChangeText={setNombre} />}

            <Field
              icon={Mail}
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Field
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                  {showPassword ? (
                    <EyeOff size={18} color={theme.inputIcon} />
                  ) : (
                    <Eye size={18} color={theme.inputIcon} />
                  )}
                </TouchableOpacity>
              }
            />

            {!isLogin && (
              <Field
                icon={Lock}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            )}

            {error && (
              <View
                className="rounded-xl px-4 py-3 mb-4 border"
                style={{ backgroundColor: theme.alertBg, borderColor: theme.alertText }}>
                <Text className="text-sm text-center font-medium" style={{ color: theme.alertText }}>{error}</Text>
              </View>
            )}

            <PrimaryButton label={isLogin ? 'Iniciar sesión' : 'Registrarse'} onPress={handleSubmit} />

            <View className="flex-row justify-center mt-6">
              <Text className="text-sm" style={{ color: theme.textSub }}>
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}>
                <Text className="text-sm font-bold" style={{ color: theme.accent }}>
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
