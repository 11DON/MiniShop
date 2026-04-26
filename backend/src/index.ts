import Fastify from 'fastify'
import cors from '@fastify/cors'
import 'dotenv/config'

import { authRoutes } from './routes/auth'
import { productRoutes } from './routes/products'
import { orderRoutes } from './routes/orders'

const fastify = Fastify({
  logger: true
})

// Plugins
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
})

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
}))

// Routes
fastify.register(authRoutes)
fastify.register(productRoutes)
fastify.register(orderRoutes)

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error)
  reply.status(error.statusCode ?? 500).send({
    statusCode: error.statusCode ?? 500,
    error: error.name ?? 'Internal Server Error',
    message: error.message,
  })
})

// Start server
const PORT = Number(process.env.PORT) || 3000

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`\n🚀 Mini Shop API running on http://0.0.0.0:${PORT}\n`)
})