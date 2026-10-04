import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { getTheme, getRandomPhrase } from '@/lib/theme';

export default function AuthScreen() {
  const theme = getTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    if (isLogin) {
      if (!email.trim() || !password) {
        setError('Por favor completa todos los campos.');
        return;
      }
      router.replace('/home');
    } else {
      if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
        setError('Por favor completa todos los campos.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      router.replace('/home');
    }
  }

  const titleColor = theme.isDay ? 'text-[#060439]' : 'text-white';
  const subColor = theme.isDay ? 'text-[#5A47C4]' : 'text-[#A9A5F3]';
  const accentColor = theme.isDay ? 'text-[#1016A5]' : 'text-[#22D3EE]';

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <ScrollView
            contentContainerClassName="flex-grow justify-center"
            keyboardShouldPersistTaps="handled">
            <View className="w-full max-w-[400px] self-center px-6 py-4">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4 border border-white/30">
                  <Text className={`text-2xl font-bold ${theme.isDay ? 'text-[#1016A5]' : 'text-white'}`}>
                    I360
                  </Text>
                </View>
                <Text className={`text-3xl font-bold mb-1 ${titleColor}`}>Bienvenido</Text>
                <Text className={`text-sm font-medium ${subColor}`}>
                  {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta en Inventario360'}
                </Text>
              </View>

              {/* Frase */}
              <View className="bg-white/10 rounded-xl p-3 mb-6 border border-white/20">
                <Text className={`text-center text-xs font-medium ${theme.isDay ? 'text-[#1016A5]' : 'text-white'}`}>
                  {getRandomPhrase()}
                </Text>
              </View>

              {/* Nombre (solo registro) */}
              {!isLogin && (
                <View className="mb-4">
                  <View
                    className={`flex-row items-center rounded-xl border px-4 h-14 ${focusedField === 'nombre' ? 'border-[#22D3EE]' : 'border-white/30'}`}
                    style={{ backgroundColor: theme.inputBg }}>
                    <User size={18} color={theme.textSub} />
                    <TextInput
                      className="flex-1 ml-3 text-[15px] font-medium"
                      style={{ color: theme.textMain }}
                      placeholder="Tu nombre"
                      placeholderTextColor="#94A3B8"
                      value={nombre}
                      onChangeText={setNombre}
                      onFocus={() => setFocusedField('nombre')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <View className="mb-4">
                <View
                  className={`flex-row items-center rounded-xl border px-4 h-14 ${focusedField === 'email' ? 'border-[#22D3EE]' : 'border-white/30'}`}
                  style={{ backgroundColor: theme.inputBg }}>
                  <Mail size={18} color={theme.textSub} />
                  <TextInput
                    className="flex-1 ml-3 text-[15px] font-medium"
                    style={{ color: theme.textMain }}
                    placeholder="tucorreo@ejemplo.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View className="mb-4">
                <View
                  className={`flex-row items-center rounded-xl border px-4 h-14 ${focusedField === 'password' ? 'border-[#22D3EE]' : 'border-white/30'}`}
                  style={{ backgroundColor: theme.inputBg }}>
                  <Lock size={18} color={theme.textSub} />
                  <TextInput
                    className="flex-1 ml-3 text-[15px] font-medium"
                    style={{ color: theme.textMain }}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                    {showPassword ? (
                      <EyeOff size={18} color={theme.textSub} />
                    ) : (
                      <Eye size={18} color={theme.textSub} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar contraseña (solo registro) */}
              {!isLogin && (
                <View className="mb-4">
                  <View
                    className={`flex-row items-center rounded-xl border px-4 h-14 ${focusedField === 'confirmPassword' ? 'border-[#22D3EE]' : 'border-white/30'}`}
                    style={{ backgroundColor: theme.inputBg }}>
                    <Lock size={18} color={theme.textSub} />
                    <TextInput
                      className="flex-1 ml-3 text-[15px] font-medium"
                      style={{ color: theme.textMain }}
                      placeholder="Confirmar contraseña"
                      placeholderTextColor="#94A3B8"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              )}

              {/* Error */}
              {error && (
                <View className="bg-red-500/20 border border-red-400/50 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-red-300 text-sm text-center font-medium">{error}</Text>
                </View>
              )}

              {/* Botón principal */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                className="rounded-xl h-14 items-center justify-center shadow-lg mt-2"
                style={{ backgroundColor: theme.ctaBg }}>
                <Text className="text-base font-bold" style={{ color: theme.ctaText }}>
                  {isLogin ? 'Iniciar sesión' : 'Registrarse'}
                </Text>
              </TouchableOpacity>

              {/* Alternar login / registro */}
              <View className="flex-row justify-center mt-6">
                <Text className={`text-sm ${subColor}`}>
                  {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}>
                  <Text className={`text-sm font-bold ${accentColor}`}>
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}