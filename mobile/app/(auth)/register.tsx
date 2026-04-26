import { useState } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { theme } from '../../constants/theme'

export default function RegisterScreen() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuthStore()
    const router = useRouter()

    const handleRegister = async () => {
        if (!name || !email || !password || !confirm) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }
        if (password !== confirm) {
            Alert.alert('Error', 'Passwords do not match')
            return
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters')
            return
        }
        try {
            setLoading(true)
            await register(name, email, password)
            router.replace('/(tabs)')
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || error.message || JSON.stringify(error.response?.data) || 'Something went wrong')
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
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.header}>
                    <Text style={styles.logo}>🛍️</Text>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join us and start shopping</Text>
                </View>



                {/* Name */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input}
                            placeholder='John Doe'
                            placeholderTextColor={theme.colors.text.light}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize='words'
                        />
                    </View>



                    {/* Email */}
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



                    {/* Password */}
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



                    {/* ConfirmPassword */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.text.light}
                            value={confirm}
                            onChangeText={setConfirm}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={theme.colors.white} />
                            : <Text style={styles.btnText}>Create Account</Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    backBtn: { position: 'absolute', top: theme.spacing.lg, left: theme.spacing.lg },
    backText: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: '600' },

    scroll: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
    header: { alignItems: 'center', marginBottom: theme.spacing.xl },
    logo: { fontSize: 64, marginBottom: theme.spacing.md },
    title: { fontSize: theme.fontSize.xxxl, fontWeight: '700', color: theme.colors.text.primary },
    subtitle: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, marginTop: 4 },
    form: { backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, padding: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    inputGroup: { marginBottom: theme.spacing.md },
    label: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 6 },
    input: { backgroundColor: theme.colors.grayLight, borderRadius: theme.radius.sm, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text.primary, borderWidth: 1, borderColor: theme.colors.grayBorder },
    btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm, padding: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.sm },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg },
    footerText: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary },
    footerLink: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600' },
})