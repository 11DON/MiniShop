import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('🌱 Seeding database...')

  // Categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .insert([
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Home & Kitchen', slug: 'home-kitchen' },
    ])
    .select()

  if (catError) {
    console.error('Category error:', catError.message)
    process.exit(1)
  }

  console.log('✅ Categories created:', categories.length)

  const electronics = categories.find((c) => c.slug === 'electronics')!
  const clothing = categories.find((c) => c.slug === 'clothing')!
  const home = categories.find((c) => c.slug === 'home-kitchen')!

  // Products
  const { data: products, error: prodError } = await supabase
    .from('products')
    .insert([
      // Electronics
      { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30hr battery life.', price: 79.99, category_id: electronics.id, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { name: 'Mechanical Keyboard', description: 'Compact TKL mechanical keyboard with RGB backlight.', price: 59.99, category_id: electronics.id, image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
      { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.', price: 34.99, category_id: electronics.id, image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400' },
      { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor and GPS.', price: 129.99, category_id: electronics.id, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      // Clothing
      { name: 'Classic White T-Shirt', description: '100% organic cotton crew neck t-shirt. Unisex fit.', price: 24.99, category_id: clothing.id, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
      { name: 'Slim Fit Chinos', description: 'Lightweight stretch chinos perfect for everyday wear.', price: 49.99, category_id: clothing.id, image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400' },
      { name: 'Hooded Sweatshirt', description: 'Cozy pullover hoodie with kangaroo pocket.', price: 39.99, category_id: clothing.id, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400' },
      // Home & Kitchen
      { name: 'Pour Over Coffee Set', description: 'Glass pour-over coffee dripper with stainless steel filter.', price: 29.99, category_id: home.id, image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
      { name: 'Ceramic Dinner Set', description: '16-piece ceramic dinnerware set for 4. Dishwasher safe.', price: 89.99, category_id: home.id, image_url: 'https://images.unsplash.com/photo-1603199766980-8c862b9d3b71?w=400' },
      { name: 'Bamboo Cutting Board', description: 'Large eco-friendly bamboo cutting board with juice groove.', price: 19.99, category_id: home.id, image_url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400' },
    ])
    .select()

  if (prodError) {
    console.error('Product error:', prodError.message)
    process.exit(1)
  }

  console.log('✅ Products created:', products.length)
  console.log('\n🎉 Seed complete!\n')
  console.log('Test credentials:')
  console.log('  Customer → customer@minishop.com / customer123')
  console.log('  Admin    → admin@minishop.com    / admin123')
  console.log('\nCreate these accounts in Supabase Auth dashboard, then run:')
  console.log("  UPDATE profiles SET role='admin' WHERE ... (see setup guide)")
}

seed().catch(console.error)