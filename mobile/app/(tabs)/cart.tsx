import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { theme } from '../../constants/theme'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export default function CartScreen() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCartStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order')
      return
    }
    if (items.length === 0) return

    Alert.alert(
      'Confirm Order',
      `Place order for $${total().toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            try {
              setLoading(true)
              const orderItems = items.map((i) => ({
                product_id: i.id,
                quantity: i.quantity,
              }))
              const { data } = await api.post('/orders', { items: orderItems })
              clearCart()
              Alert.alert(
                '🎉 Order Placed!',
                `Your order #${data.order.id.slice(0, 8)} has been placed successfully!`,
                [{ text: 'View Orders', onPress: () => router.push('/(tabs)/orders') }]
              )
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Could not place order')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add some products to get started</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearCart },
        ])}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => removeItem(item.id)}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total().toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={theme.colors.white} />
            : <Text style={styles.checkoutBtnText}>Place Order • ${total().toFixed(2)}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: 56, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.white },
  headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text.primary },
  clearText: { fontSize: theme.fontSize.sm, color: theme.colors.error, fontWeight: '600' },
  list: { padding: theme.spacing.md, paddingBottom: 260 },
  card: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, marginBottom: theme.spacing.md, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardImage: { width: 100, height: 100 },
  cardBody: { flex: 1, padding: theme.spacing.sm },
  cardName: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 4 },
  cardPrice: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.grayLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.grayBorder },
  qtyBtnText: { fontSize: 16, color: theme.colors.text.primary, fontWeight: '600' },
  qtyValue: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text.primary, minWidth: 24, textAlign: 'center' },
  itemTotal: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primary, marginLeft: 4 },
  deleteBtn: { padding: theme.spacing.sm, justifyContent: 'flex-start' },
  deleteBtnText: { fontSize: 18 },
  summary: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.grayBorder, elevation: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  summaryLabel: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary },
  summaryValue: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text.primary },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.grayBorder, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text.primary },
  totalValue: { fontSize: theme.fontSize.lg, fontWeight: '800', color: theme.colors.primary },
  checkoutBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: theme.spacing.md, alignItems: 'center' },
  checkoutBtnDisabled: { opacity: 0.7 },
  checkoutBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyIcon: { fontSize: 80, marginBottom: theme.spacing.lg },
  emptyTitle: { fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.colors.text.primary, marginBottom: theme.spacing.sm },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, marginBottom: theme.spacing.xl },
  shopBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  shopBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
})