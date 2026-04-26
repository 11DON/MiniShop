import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  )
}

function CartTabIcon({ focused }: { focused: boolean }) {
const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  return (
    <View style={styles.tabItem}>
      <View>
        <Text style={styles.tabEmoji}>🛒</Text>
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Cart</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏪" label="Shop" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopColor: theme.colors.grayBorder,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 ,width:60},
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: theme.fontSize.xs, color: theme.colors.text.light, fontWeight: '500' },
  tabLabelActive: { color: theme.colors.primary, fontWeight: '700' },
badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
},
badgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '800', lineHeight: 18 },
})