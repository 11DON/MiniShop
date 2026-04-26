import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { theme } from '../../constants/theme'
import { api } from '../../lib/api'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  products: { id: string; name: string; image_url: string }
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
}

const STATUS_ICONS: Record<string, string> = {
  pending: '⏳',
  processing: '⚙️',
  shipped: '🚚',
  delivered: '✅',
  cancelled: '❌',
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my')
      setOrders(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refetch every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders()
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} orders total</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/order/${item.id}` as any)}
            activeOpacity={0.85}
          >
            {/* Order header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>
                  Order #{item.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                <Text style={styles.statusIcon}>{STATUS_ICONS[item.status]}</Text>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Order items preview */}
            <View style={styles.itemsPreview}>
              <Text style={styles.itemsText}>
                {item.order_items.map((i) => `${i.products.name} x${i.quantity}`).join(' · ')}
              </Text>
            </View>

            {/* Order footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.itemCount}>
                {item.order_items.reduce((sum, i) => sum + i.quantity, 0)} items
              </Text>
              <Text style={styles.totalAmount}>
                ${Number(item.total_amount).toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Your orders will appear here</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: 56, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.white },
  headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text.primary },
  headerSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, marginTop: 2 },
  list: { padding: theme.spacing.md, paddingBottom: 100 },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, marginBottom: theme.spacing.md, padding: theme.spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  orderId: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text.primary },
  orderDate: { fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: theme.fontSize.xs, fontWeight: '700' },
  itemsPreview: { backgroundColor: theme.colors.grayLight, borderRadius: theme.radius.sm, padding: theme.spacing.sm, marginBottom: theme.spacing.sm },
  itemsText: { fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary },
  totalAmount: { fontSize: theme.fontSize.lg, fontWeight: '800', color: theme.colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 64, marginBottom: theme.spacing.md },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text.primary, marginBottom: theme.spacing.sm },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, marginBottom: theme.spacing.xl },
  shopBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  shopBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
})