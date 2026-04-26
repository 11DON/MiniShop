import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid("Invalid product ID"),
      quantity: z.number().int().positive("Quantity must be at least 1"),
    }),
  )
  .min(1,'Order must have at least one item')
});


export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderQuery = z.infer<typeof orderQuerySchema>