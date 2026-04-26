import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  role: 'customer' | 'admin'
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    })
  }

  const token = authHeader.split(' ')[1]

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'User profile not found',
    })
  }

  request.user = {
    id: user.id,
    email: user.email!,
    role: profile.role as 'customer' | 'admin',
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  await authenticate(request, reply)

  if (request.user && request.user.role !== 'admin') {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Admin access required',
    })
  }
}