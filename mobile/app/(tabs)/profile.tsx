import { useRouter } from 'expo-router'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { theme } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const MenuItem = ({
    icon, label, onPress, danger
  }: {
    icon: string
    label: string
    onPress: () => void
    danger?: boolean
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar & info */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="📦"
            label="My Orders"
            onPress={() => router.push('/(tabs)/orders')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="🔑"
            label="Change Password"
            onPress={() => router.push('/(auth)/forgot-password')}
          />
        </View>
      </View>


      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="ℹ️"
            label="About MiniShop"
            onPress={() => Alert.alert('MiniShop', 'Version 1.0.0\nBuilt with Expo & Supabase')}
          />
        </View>
      </View>


      {/* Sign out */}
      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="🚪"
            label="Sign Out"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>

            <Text style={styles.version}>MiniShop v1.0.0</Text>

    </ScrollView>

  )
}





















const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: 56, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.white },
  headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text.primary },
  avatarSection: { alignItems: 'center', backgroundColor: theme.colors.white, paddingVertical: theme.spacing.xl, marginBottom: theme.spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md },
  avatarText: { fontSize: 36, fontWeight: '700', color: theme.colors.white },
  userName: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 4 },
  userEmail: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm },
  roleBadge: { backgroundColor: theme.colors.grayLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: theme.radius.full },
  roleText: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, fontWeight: '600' },
  menuSection: { paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md },
  menuSectionTitle: { fontSize: theme.fontSize.xs, fontWeight: '700', color: theme.colors.text.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginLeft: 4 },
  menuCard: { backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md },
  menuIcon: { fontSize: 20, marginRight: theme.spacing.md },
  menuLabel: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text.primary, fontWeight: '500' },
  menuLabelDanger: { color: theme.colors.error },
  menuArrow: { fontSize: 20, color: theme.colors.text.light },
  divider: { height: 1, backgroundColor: theme.colors.grayBorder, marginLeft: 52 },
  version: { textAlign: 'center', fontSize: theme.fontSize.xs, color: theme.colors.text.light, marginTop: theme.spacing.md },
})