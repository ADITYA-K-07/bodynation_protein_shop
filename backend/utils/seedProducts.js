import Product from '../models/Product.js';
import { products as seedProducts } from '../../frontend/js/data.js';

function normalizeSeedProduct(product) {
  return {
    id: String(product.id || '').trim(),
    slug: String(product.slug || '').trim(),
    brand: String(product.brand || '').trim(),
    name: String(product.name || '').trim(),
    shortName: String(product.shortName || '').trim(),
    category: String(product.category || '').trim(),
    goal: String(product.goal || '').trim(),
    color: String(product.color || '').trim(),
    image: String(product.image || '').trim(),
    heroImage: String(product.heroImage || '').trim(),
    ratingAverage: Number(product.ratingAverage || 0),
    ratingCount: Number(product.ratingCount || 0),
    badges: Array.isArray(product.badges) ? product.badges : [],
    description: String(product.description || '').trim(),
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    nutritionFacts: Array.isArray(product.nutritionFacts) ? product.nutritionFacts : [],
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => ({
          id: String(variant.id || '').trim(),
          flavour: String(variant.flavour || '').trim(),
          size: String(variant.size || '').trim(),
          price: Number(variant.price || 0),
          mrp: Number(variant.mrp || 0),
          stock: Number(variant.stock || 0),
        }))
      : [],
    labReportUrl: String(product.labReportUrl || '#').trim(),
    isActive: true,
  };
}

export async function seedProductsIfEmpty() {
  const productCount = await Product.countDocuments();

  if (productCount > 0) {
    console.log(`Products collection already populated (${productCount} items)`);
    return;
  }

  const normalizedProducts = seedProducts.map(normalizeSeedProduct);
  await Product.insertMany(normalizedProducts);
  console.log(`Seeded ${normalizedProducts.length} products from frontend/js/data.js`);
}
