import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from '../schemas/auth.schema'

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/register
  fastify.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = registerSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.errors[0].message,
      })
    }

    const { name, email, password } = result.data

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Registration Failed',
        message: error.message,
      })
    }

    return reply.status(201).send({
      message: 'Registration successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
      },
    })
  })

  // POST /auth/login
  fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = loginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.errors[0].message,
      })
    }

    const { email, password } = result.data

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Login Failed',
        message: 'Invalid email or password',
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .single()

    return reply.send({
      access_token: data.session.access_token,
      token_type: 'Bearer',
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        role: profile?.role,
      },
    })
  })

  // POST /auth/forgotpassword
  fastify.post('/auth/forgotpassword', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = forgotPasswordSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: result.error.errors[0].message,
      })
    }

    const { email } = result.data

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Reset Failed',
        message: error.message,
      })
    }

    return reply.send({
      message: 'If an account exists with that email, a reset link has been sent.',
    })
  })

  // GET /auth/me
  fastify.get(
    '/auth/me',
    { preHandler: authenticate },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, role, created_at')
        .eq('id', request.user.id)
        .single()

      if (error || !profile) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Profile not found',
        })
      }

      return reply.send({
        id: profile.id,
        email: request.user.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at,
      })
    }
  )
}