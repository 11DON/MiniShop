import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  FlatList, Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { theme } from '../../constants/theme'
import { api } from '../../lib/api'
import { useCartStore } from '../../store/cartStore'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  description: string
  categories: { id: string; name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const fetchProducts = useCallback(async () => {
    try {
        const params: any = {}
    if (search) params.search = search
    if (selectedCategory) params.category = selectedCategory
    console.log('fetching with params:', params) // ← add this
    const { data } = await api.get('/products', { params })
    setProducts(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search, selectedCategory])

  const fetchCategories = async () => {
  try {
    const { data } = await api.get('/products')
    console.log('categories response:', JSON.stringify(data.data[0]))
    const cats: Category[] = []
    data.data.forEach((p: Product) => {
      if (p.categories && !cats.find(c => c.id === p.categories.id)) {
        cats.push(p.categories)
      }
    })
    console.log('extracted cats:', cats)
    setCategories(cats)
  } catch (e) {
    console.error('fetchCategories error:', e)  // stop silencing this
  }
}


  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(fetchProducts, 400)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const onRefresh = () => {
    setRefreshing(true)
    fetchProducts()
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addItem({
              id: item.id,
              name: item.name,
              price: item.price,
              image_url: item.image_url,
            })}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderSkeleton = () => (
    <View style={styles.skeletonGrid}>
      {[1,2,3,4].map(i => (
        <View key={i} style={styles.skeleton}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
        </View>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ MiniShop</Text>
        <Text style={styles.headerSubtitle}>Find what you love</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={theme.colors.text.light}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: theme.colors.gray }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <View>
        <FlatList
          data={[{ id: '', name: 'All', slug: '' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryTab, selectedCategory === item.slug && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(item.slug)}
            >
              <Text style={[styles.categoryTabText, selectedCategory === item.slug && styles.categoryTabTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products */}
      {loading ? renderSkeleton() : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productList}
          renderItem={renderProduct}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: 56, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.white },
  headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text.primary },
  headerSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, margin: theme.spacing.md, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.grayBorder },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: theme.fontSize.md, color: theme.colors.text.primary },
  categoryList: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: 8 },
  categoryTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.grayLight, borderWidth: 1, borderColor: theme.colors.grayBorder },
  categoryTabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryTabText: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, fontWeight: '500' },
  categoryTabTextActive: { color: theme.colors.white, fontWeight: '700' },
  row: { justifyContent: 'space-between', paddingHorizontal: theme.spacing.md },
  productList: { paddingTop: theme.spacing.sm, paddingBottom: 100 },
  card: { width: '48%', backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, marginBottom: theme.spacing.md, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardImage: { width: '100%', height: 150 },
  cardBody: { padding: theme.spacing.sm },
  cardName: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: theme.fontSize.md, fontWeight: '800', color: theme.colors.primary },
  addBtn: { backgroundColor: theme.colors.primary, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: theme.colors.white, fontSize: 20, fontWeight: '700', lineHeight: 28 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: theme.spacing.md, gap: theme.spacing.md },
  skeleton: { width: '47%', backgroundColor: theme.colors.white, borderRadius: theme.radius.lg, overflow: 'hidden', padding: theme.spacing.sm },
  skeletonImage: { width: '100%', height: 150, backgroundColor: theme.colors.grayLight, borderRadius: theme.radius.sm, marginBottom: 8 },
  skeletonLine: { height: 12, backgroundColor: theme.colors.grayLight, borderRadius: 6, marginBottom: 6, width: '80%' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: theme.spacing.md },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.text.secondary },
})