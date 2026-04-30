import { APP_CONFIG, buildApiUrl, isStaticPreview } from "./config.js";
import { products as seedProducts } from "./data.js";

let cachedCatalog = null;

export async function getCatalog() {
  if (cachedCatalog) {
    return { products: cachedCatalog, mode: "cache" };
  }

  if (isStaticPreview()) {
    cachedCatalog = seedProducts;
    return { products: cachedCatalog, mode: "seed" };
  }

  try {
    const response = await fetch(buildApiUrl(APP_CONFIG.endpoints.products));
    if (!response.ok) {
      throw new Error(`Products request failed: ${response.status}`);
    }

    const payload = await response.json();
    const normalizedProducts = Array.isArray(payload) ? payload : payload.products;
    if (!Array.isArray(normalizedProducts)) {
      throw new Error("Products response was not an array.");
    }

    cachedCatalog = normalizedProducts;
    return { products: cachedCatalog, mode: "api" };
  } catch (error) {
    cachedCatalog = seedProducts;
    return { products: cachedCatalog, mode: "seed", error };
  }
}

export async function getProductBySlug(slug) {
  const catalog = await getCatalog();
  return {
    ...catalog,
    product: catalog.products.find((item) => item.slug === slug) || null,
  };
}
