import { APP_CONFIG } from "./config.js";

const CART_KEY = "bodynation.cart";
const WISHLIST_KEY = "bodynation.wishlist";
const LAST_ORDER_KEY = "bodynation.last-order";

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function emit(name) {
  window.dispatchEvent(new CustomEvent(name));
}

export function getCart() {
  return readJson(CART_KEY, []);
}

export function setCart(cart) {
  writeJson(CART_KEY, cart);
  emit("bodynation:cart-updated");
}

export function getWishlist() {
  return readJson(WISHLIST_KEY, []);
}

export function setWishlist(wishlist) {
  writeJson(WISHLIST_KEY, wishlist);
  emit("bodynation:wishlist-updated");
}

export function getLastOrder() {
  return readJson(LAST_ORDER_KEY, null);
}

export function setLastOrder(order) {
  writeJson(LAST_ORDER_KEY, order);
}

export function clearCart() {
  setCart([]);
}

export function getCartCount() {
  return getCart().reduce((count, item) => count + item.qty, 0);
}

export function getWishlistCount() {
  return getWishlist().length;
}

export function isWishlisted(slug) {
  return getWishlist().includes(slug);
}

export function toggleWishlist(slug) {
  const wishlist = getWishlist();
  const nextWishlist = wishlist.includes(slug)
    ? wishlist.filter((item) => item !== slug)
    : [...wishlist, slug];
  setWishlist(nextWishlist);
  return nextWishlist.includes(slug);
}

export function addToCart(product, variantId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(
    (item) => item.slug === product.slug && item.variantId === variantId
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      slug: product.slug,
      variantId,
      qty,
    });
  }

  setCart(cart);
}

export function updateCartItemQty(slug, variantId, qty) {
  const cart = getCart()
    .map((item) => {
      if (item.slug === slug && item.variantId === variantId) {
        return { ...item, qty };
      }
      return item;
    })
    .filter((item) => item.qty > 0);

  setCart(cart);
}

export function removeFromCart(slug, variantId) {
  const cart = getCart().filter(
    (item) => !(item.slug === slug && item.variantId === variantId)
  );
  setCart(cart);
}

export function findVariant(product, variantId) {
  return product.variants.find((variant) => variant.id === variantId) || product.variants[0];
}

export function buildCartDetails(products) {
  const items = getCart()
    .map((cartItem) => {
      const product = products.find((item) => item.slug === cartItem.slug);
      if (!product) {
        return null;
      }
      const variant = findVariant(product, cartItem.variantId);
      return {
        slug: product.slug,
        name: product.name,
        shortName: product.shortName,
        brand: product.brand,
        image: product.image,
        qty: cartItem.qty,
        variantId: variant.id,
        flavour: variant.flavour,
        size: variant.size,
        price: variant.price,
        mrp: variant.mrp,
        lineTotal: variant.price * cartItem.qty,
        lineSavings: (variant.mrp - variant.price) * cartItem.qty,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = items.reduce((sum, item) => sum + item.lineSavings, 0);
  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= APP_CONFIG.freeShippingThreshold
        ? 0
        : APP_CONFIG.flatShippingFee;

  return {
    items,
    subtotal,
    discount,
    shipping,
    total: subtotal + shipping,
  };
}
