import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { theme } from '../../constants/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      await login(email, password)
      router.replace('/(tabs)')
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.text.light}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.text.light}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={theme.colors.white} />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  logo: { fontSize: 64, marginBottom: theme.spacing.md },
  title: { fontSize: theme.fontSize.xxxl, fontWeight: '700', color: theme.colors.text.primary },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, marginTop: 4 },
  form: { backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, padding: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  inputGroup: { marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 6 },
  input: { backgroundColor: theme.colors.grayLight, borderRadius: theme.radius.sm, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text.primary, borderWidth: 1, borderColor: theme.colors.grayBorder },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: theme.spacing.lg },
  forgotText: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '500' },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm, padding: theme.spacing.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg },
  footerText: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary },
  footerLink: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600' },
})