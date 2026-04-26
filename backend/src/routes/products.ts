import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'
import { authenticate, requireAdmin } from '../middleware/authenticate'
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/product.schema'

export async function productRoutes(fastify: FastifyInstance) {
  // GET /products
fastify.get<{ Params: { id: string } }>('/products', async (request, reply) => {
    const result = productQuerySchema.safeParse(request.query)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.errors[0].message,
      })
    }

    const { search, category, page, limit } = result.data
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

 if (category) {
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category)  // ← just this
    .single()

  if (cat) {
    query = query.eq('category_id', cat.id)
  }
}

    const { data, error, count } = await query

    if (error) {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error.message,
      })
    }

    return reply.send({
      data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  })

  // GET /products/:id
  fastify.get('/products/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Product not found',
      })
    }

    return reply.send(data)
  })

  // POST /products — admin only
  fastify.post(
    '/products',
    { preHandler: requireAdmin },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = createProductSchema.safeParse(request.body)
      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.errors[0].message,
        })
      }

      const { data, error } = await supabase
        .from('products')
        .insert(result.data)
        .select()
        .single()

      if (error) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: error.message,
        })
      }

      return reply.status(201).send(data)
    }
  )

  // PATCH /products/:id — admin only
fastify.patch<{ Params: { id: string } }>('/products/:id', { preHandler: requireAdmin }, async (request, reply) => {

      const { id } = request.params
      const result = updateProductSchema.safeParse(request.body)

      if (!result.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: result.error.errors[0].message,
        })
      }

      const { data, error } = await supabase
        .from('products')
        .update(result.data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Product not found',
        })
      }

      return reply.send(data)
    }
  )

  // DELETE /products/:id — soft delete, admin only
fastify.delete<{ Params: { id: string } }>('/products/:id', { preHandler: requireAdmin }, async (request, reply) => {

      const { id } = request.params

      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Product not found',
        })
      }

      return reply.send({ message: 'Product deleted successfully' })
    }
  )
}