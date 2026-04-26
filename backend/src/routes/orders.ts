import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'
import { authenticate, requireAdmin } from '../middleware/authenticate'
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../schemas/order.schema'

export async function orderRoutes(fastify: FastifyInstance) {
  // POST /orders
  fastify.post(
    '/orders',
    { preHandler: authenticate },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = createOrderSchema.safeParse(request.body)
      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.errors[0].message,
        })
      }

      const { items } = result.data
      const userId = request.user.id

      const productIds = items.map((i) => i.product_id)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, price, is_active')
        .in('id', productIds)

      if (productsError || !products) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Could not fetch products',
        })
      }

      for (const item of items) {
        const product = products.find((p) => p.id === item.product_id)
        if (!product) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: `Product ${item.product_id} not found`,
          })
        }
        if (!product.is_active) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: `Product ${item.product_id} is no longer available`,
          })
        }
      }

      const total_amount = items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.product_id)!
        return sum + product.price * item.quantity
      }, 0)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: userId, total_amount, status: 'pending' })
        .select()
        .single()

      if (orderError || !order) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Could not create order',
        })
      }

      const orderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.product_id)!
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id)
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Could not save order items',
        })
      }

      return reply.status(201).send({
        message: 'Order placed successfully',
        order: { ...order, items: orderItems },
      })
    }
  )

  // GET /orders/my
  fastify.get(
    '/orders/my',
    { preHandler: authenticate },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            products (id, name, image_url)
          )
        `)
        .eq('user_id', request.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: error.message,
        })
      }

      return reply.send({ data })
    }
  )

  // GET /orders — admin only
fastify.get(
  '/orders',
  { preHandler: requireAdmin },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const result = orderQuerySchema.safeParse(request.query)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.errors[0].message,
      })
    }

    const { page, limit, status } = result.data
    const from = (page - 1) * limit
    const to = from + limit - 1

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            products (id, name, image_url)
          )
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data: orders, error, count } = await query

      if (error) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: error.message,
        })
      }

      // Fetch profile names separately
      const userIds = [...new Set(orders.map((o: any) => o.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds)

      // Attach profile to each order
      const ordersWithProfiles = orders.map((order: any) => ({
        ...order,
        profiles: profiles?.find((p: any) => p.id === order.user_id) ?? null,
      }))

      return reply.send({
        data: ordersWithProfiles,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      })
    } catch (err) {
      console.error('ORDERS CATCH:', err)
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Unexpected error',
      })
    }
  }
)

  // PATCH /orders/:id/status — admin only
fastify.patch<{ Params: { id: string } }>('/orders/:id/status', { preHandler: requireAdmin }, async (request, reply) => {

      const { id } = request.params
      const result = updateOrderStatusSchema.safeParse(request.body)

      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.errors[0].message,
        })
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status: result.data.status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Order not found',
        })
      }

      return reply.send(data)
    }
  )
}