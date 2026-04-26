import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator, Image,
    ScrollView,
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

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get('/orders/my')
        const found = data.data.find((o: Order) => o.id === id)
        setOrder(found || null)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFound}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Order ID & Status */}
        <View style={styles.section}>
          <Text style={styles.orderId}>
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
            <Text style={styles.statusIcon}>{STATUS_ICONS[order.status]}</Text>
            <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            <View style={styles.progressRow}>
              {STATUS_STEPS.map((step, index) => (
                <View key={step} style={styles.progressStep}>
                  <View style={[
                    styles.progressDot,
                    index <= currentStep && styles.progressDotActive
                  ]}>
                    <Text style={styles.progressDotText}>
                      {index < currentStep ? '✓' : STATUS_ICONS[step]}
                    </Text>
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={[
                      styles.progressLine,
                      index < currentStep && styles.progressLineActive
                    ]} />
                  )}
                  <Text style={[
                    styles.progressLabel,
                    index <= currentStep && styles.progressLabelActive
                  ]}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Order items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {order.order_items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image
                source={{ uri: item.products.image_url }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.products.name}
                </Text>
                <Text style={styles.itemPrice}>
                  ${item.unit_price.toFixed(2)} each
                </Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>
                ${(item.unit_price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${Number(order.total_amount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${Number(order.total_amount).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: theme.fontSize.lg, color: theme.colors.text.secondary, marginBottom: theme.spacing.md },
  backLink: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: 56, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.grayBorder },
  backBtn: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text.primary },
  scroll: { padding: theme.spacing.md, paddingBottom: 40 },
  section: { backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  orderId: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 4 },
  orderDate: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full },
  statusIcon: { fontSize: 14 },
  statusText: { fontSize: theme.fontSize.sm, fontWeight: '700' },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text.primary, marginBottom: theme.spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  progressStep: { flex: 1, alignItems: 'center' },
  progressDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.grayLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: theme.colors.grayBorder },
  progressDotActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  progressDotText: { fontSize: 14 },
  progressLine: { position: 'absolute', top: 18, left: '60%', right: '-60%', height: 2, backgroundColor: theme.colors.grayBorder, zIndex: -1 },
  progressLineActive: { backgroundColor: theme.colors.primary },
  progressLabel: { fontSize: 10, color: theme.colors.text.light, textAlign: 'center', fontWeight: '500' },
  progressLabelActive: { color: theme.colors.primary, fontWeight: '700' },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.grayBorder },
  itemImage: { width: 70, height: 70, borderRadius: theme.radius.sm, marginRight: theme.spacing.md },
  itemBody: { flex: 1 },
  itemName: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 4 },
  itemPrice: { fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, marginBottom: 2 },
  itemQty: { fontSize: theme.fontSize.xs, color: theme.colors.text.secondary },
  itemTotal: { fontSize: theme.fontSize.md, fontWeight: '800', color: theme.colors.primary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  summaryLabel: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary },
  summaryValue: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text.primary },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.grayBorder, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm },
  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text.primary },
  totalValue: { fontSize: theme.fontSize.lg, fontWeight: '800', color: theme.colors.primary },
})