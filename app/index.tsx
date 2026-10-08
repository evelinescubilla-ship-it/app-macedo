import { useEffect, useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  KeyboardTypeOptions,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { getRandomPhrase } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { abrirSesion, restaurarSesion } from '@/lib/store';
import { saveUser, saveNombre, getNombre } from '@/lib/session';
import { login, signup, checkHealth } from '@/services/auth';
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
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restaurando, setRestaurando] = useState(true);
  const [servidor, setServidor] = useState<'probando' | 'ok' | 'error'>('probando');
  const [frase] = useState(getRandomPhrase);

  // Al abrir: retoma la sesión guardada y comprueba que el backend esté activo
  useEffect(() => {
    let activo = true;
    (async () => {
      const hayServidor = await checkHealth();
      if (activo) setServidor(hayServidor ? 'ok' : 'error');
      const entro = await restaurarSesion();
      if (!activo) return;
      if (entro) {
        router.replace('/home');
      } else {
        setRestaurando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  async function handleSubmit() {
    setError(null);
    setMensaje(null);
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
    if (!isLogin) {
      if (password.length < 8 || password.length > 72) {
        setError('La contraseña debe tener entre 8 y 72 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    try {
      setLoading(true);
      if (isLogin) {
        const data = await login(email.trim(), password);
        const nombreGuardado = await getNombre(email);
        const sesion = {
          id: data.user.id,
          email: data.user.email,
          nombre: nombreGuardado || data.user.email.split('@')[0],
        };
        await saveUser(sesion);
        await abrirSesion(sesion);
        router.replace('/home');
      } else {
        await signup(email.trim(), password);
        await saveNombre(email, nombre);
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        setMensaje('¡Cuenta creada! Ahora inicia sesión con tu correo y contraseña.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la operación.');
    } finally {
      setLoading(false);
    }
  }

  if (restaurando) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.accent} />
          <Text className="text-sm mt-4" style={{ color: theme.textSub }}>Cargando tu sesión...</Text>
        </View>
      </Screen>
    );
  }

  const colorServidor =
    servidor === 'ok' ? theme.successText : servidor === 'error' ? theme.alertText : theme.textSub;
  const textoServidor =
    servidor === 'ok'
      ? 'Servidor conectado'
      : servidor === 'error'
        ? 'Sin conexión con el servidor'
        : 'Comprobando servidor...';

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
              placeholder={isLogin ? '••••••••' : 'Contraseña (8 a 72 caracteres)'}
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

            {mensaje && (
              <View
                className="rounded-xl px-4 py-3 mb-4 border"
                style={{ backgroundColor: theme.successBg, borderColor: theme.successText }}>
                <Text className="text-sm text-center font-medium" style={{ color: theme.successText }}>{mensaje}</Text>
              </View>
            )}

            {error && (
              <View
                className="rounded-xl px-4 py-3 mb-4 border"
                style={{ backgroundColor: theme.alertBg, borderColor: theme.alertText }}>
                <Text className="text-sm text-center font-medium" style={{ color: theme.alertText }}>{error}</Text>
              </View>
            )}

            <PrimaryButton
              label={loading ? (isLogin ? 'Ingresando...' : 'Registrando...') : isLogin ? 'Iniciar sesión' : 'Registrarse'}
              onPress={handleSubmit}
              loading={loading}
            />

            <View className="flex-row justify-center mt-6">
              <Text className="text-sm" style={{ color: theme.textSub }}>
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setMensaje(null);
                }}>
                <Text className="text-sm font-bold" style={{ color: theme.accent }}>
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-center mt-6 font-semibold" style={{ color: colorServidor }}>
              ● {textoServidor}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}