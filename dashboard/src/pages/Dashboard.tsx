import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface KPI {
  ordersToday: number
  revenueToday: number
  activeProducts: number
  totalOrders: number
}

function KPICard({ icon, label, value, sub, color }: {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPI>({
    ordersToday: 0,
    revenueToday: 0,
    activeProducts: 0,
    totalOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders?limit=50'),
          api.get('/products?limit=100'),
        ])

        const orders = ordersRes.data.data
        const products = productsRes.data.data

        const today = new Date().toDateString()
        const ordersToday = orders.filter((o: any) =>
          new Date(o.created_at).toDateString() === today
        )

        setKpi({
          ordersToday: ordersToday.length,
          revenueToday: ordersToday.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0),
          activeProducts: products.filter((p: any) => p.is_active).length,
          totalOrders: ordersRes.data.pagination.total,
        })

        setRecentOrders(orders.slice(0, 8))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-28 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
              <div className="h-6 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon="🛍️"
          label="Orders Today"
          value={kpi.ordersToday}
          sub="New orders placed today"
          color="bg-purple-50"
        />
        <KPICard
          icon="💰"
          label="Revenue Today"
          value={`$${kpi.revenueToday.toFixed(2)}`}
          sub="Total sales today"
          color="bg-green-50"
        />
        <KPICard
          icon="📦"
          label="Active Products"
          value={kpi.activeProducts}
          sub="Products available"
          color="bg-blue-50"
        />
        <KPICard
          icon="📋"
          label="Total Orders"
          value={kpi.totalOrders}
          sub="All time orders"
          color="bg-orange-50"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider px-6 py-3">Order ID</th>
                <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-600 text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.profiles?.name ?? 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}