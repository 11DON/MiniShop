import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert, KeyboardAvoidingView,
  Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const router = useRouter()

const handleReset = async()=> {
    if(!email) {
        Alert.alert('Error','Please enter your email address')
        return
    } try {
        setLoading(true)
        const {error} = await supabase.auth.resetPasswordForEmail(email,{
            redirectTo:"minishop://reset-password"
        })
        if(error) throw error
        setSent(true)
    } catch(error:any){
        Alert.alert('Error',error.message||'Something Went Wrong')
    } finally {
        setLoading(false)
    }
}
// Success state
if(sent){
    return (
        <View style={styles.container}>
            <View style={styles.successBox}>
          <Text style={styles.successIcon}>📬</Text>
                <Text style={styles.successTitle}>Chech your email</Text>
                <Text style={styles.successText}>We sent a password reset link to {email}</Text>
                <TouchableOpacity style={styles.btn} onPress={()=> router.replace('/(auth)/login')}>
                    <Text style={styles.btnText}>Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>🔑</Text>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
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
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={theme.colors.white} />
              : <Text style={styles.btnText}>Send Reset Link</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
    backBtn: { position: 'absolute', top: theme.spacing.lg, left: theme.spacing.lg },
    backText: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: '600' },
    header: { alignItems: 'center', marginBottom: theme.spacing.xl },
    logo: { fontSize: 64, marginBottom: theme.spacing.md },
    title: { fontSize: theme.fontSize.xxxl, fontWeight: '700', color: theme.colors.text.primary },
    subtitle: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, marginTop: 4, textAlign: 'center' },
    form: { backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, padding: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    inputGroup: { marginBottom: theme.spacing.md },
    label: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 6 },
    input: { backgroundColor: theme.colors.grayLight, borderRadius: theme.radius.sm, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text.primary, borderWidth: 1, borderColor: theme.colors.grayBorder },
    btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm, padding: theme.spacing.md, alignItems: 'center' },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
    // Success state
    successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    successIcon: { fontSize: 80, marginBottom: theme.spacing.lg },
    successTitle: { fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.colors.text.primary, marginBottom: theme.spacing.sm },
    successText: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.xl, lineHeight: 24 },
    emailHighlight: { color: theme.colors.primary, fontWeight: '600' },
})