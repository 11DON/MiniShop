import {z} from 'zod'


export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  image_url: z.string().url().optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  is_active: z.boolean().default(true),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
limit: z.coerce.number().min(1).max(200).default(20),
})


export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>