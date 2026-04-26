import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator, Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { theme } from '../../constants/theme'
import { api } from '../../lib/api'
import { useCartStore } from '../../store/cartStore'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  categories: { name: string }
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)

  const inCart = cartItems.find((i) => i.id === id)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`)
        setProduct(data)
      } catch {
        Alert.alert('Error', 'Product not found')
        router.back()
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    setAdding(true)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      })
    }
    setTimeout(() => setAdding(false), 600)
    Alert.alert('Added to Cart ✅', `${quantity}x ${product.name} added to your cart`)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  if (!product) return null

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View>
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {product.categories && (
            <Text style={styles.category}>{product.categories.name}</Text>
          )}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.desc}>{product.description}</Text>

          {/* Quantity selector */}
          <Text style={styles.descTitle}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.qtyTotal}>
              = ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>

          {inCart && (
            <View style={styles.inCartBadge}>
              <Text style={styles.inCartText}>
                🛒 {inCart.quantity} already in cart
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom add to cart button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomPrice}>
            ${(product.price * quantity).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, adding && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={adding}
        >
          {adding
            ? <ActivityIndicator color={theme.colors.white} />
            : <Text style={styles.addBtnText}>Add to Cart 🛒</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 320 },
  backBtn: { position: 'absolute', top: 48, left: 16, backgroundColor: theme.colors.white, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  backBtnText: { fontSize: 20, color: theme.colors.text.primary },
  content: { backgroundColor: theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: theme.spacing.lg, paddingBottom: 120 },
  category: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  name: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 8 },
  price: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.primary, marginBottom: theme.spacing.lg },
  descTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 8 },
  desc: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, lineHeight: 24, marginBottom: theme.spacing.lg },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.grayLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.grayBorder },
  qtyBtnText: { fontSize: 20, color: theme.colors.text.primary, fontWeight: '600' },
  qtyValue: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text.primary, minWidth: 32, textAlign: 'center' },
  qtyTotal: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary, fontWeight: '500' },
  inCartBadge: { backgroundColor: '#E8F5E9', borderRadius: theme.radius.sm, padding: theme.spacing.sm, marginBottom: theme.spacing.md },
  inCartText: { color: theme.colors.success, fontWeight: '600', fontSize: theme.fontSize.sm },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.white, padding: theme.spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.grayBorder, elevation: 8 },
  bottomLabel: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary },
  bottomPrice: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.text.primary },
  addBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  addBtnDisabled: { opacity: 0.7 },
  addBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: '700' },
})