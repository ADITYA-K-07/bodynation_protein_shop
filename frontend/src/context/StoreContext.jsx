import { createContext, useContext, useEffect, useState } from "react";
import {
  addToCart as addToCartStorage,
  clearCart,
  getCart,
  getLastOrder,
  getWishlist,
  removeFromCart as removeFromCartStorage,
  setLastOrder,
  toggleWishlist as toggleWishlistStorage,
  updateCartItemQty as updateCartItemQtyStorage,
} from "../../js/storage.js";

const StoreContext = createContext(null);

function readStore() {
  return {
    cart: getCart(),
    wishlist: getWishlist(),
    lastOrder: getLastOrder(),
  };
}

export function StoreProvider({ children }) {
  const [store, setStore] = useState(readStore);

  useEffect(() => {
    function syncStore() {
      setStore(readStore());
    }

    window.addEventListener("bodynation:cart-updated", syncStore);
    window.addEventListener("bodynation:wishlist-updated", syncStore);
    window.addEventListener("storage", syncStore);
    return () => {
      window.removeEventListener("bodynation:cart-updated", syncStore);
      window.removeEventListener("bodynation:wishlist-updated", syncStore);
      window.removeEventListener("storage", syncStore);
    };
  }, []);

  function refresh() {
    setStore(readStore());
  }

  function addToCart(product, variantId, qty = 1) {
    addToCartStorage(product, variantId, qty);
    refresh();
  }

  function updateCartItemQty(slug, variantId, qty) {
    updateCartItemQtyStorage(slug, variantId, qty);
    refresh();
  }

  function removeFromCart(slug, variantId) {
    removeFromCartStorage(slug, variantId);
    refresh();
  }

  function toggleWishlist(slug) {
    const active = toggleWishlistStorage(slug);
    refresh();
    return active;
  }

  function saveOrder(order) {
    setLastOrder(order);
    clearCart();
    refresh();
  }

  const value = {
    cart: store.cart,
    wishlist: store.wishlist,
    lastOrder: store.lastOrder,
    cartCount: store.cart.reduce((count, item) => count + item.qty, 0),
    wishlistCount: store.wishlist.length,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    toggleWishlist,
    isWishlisted: (slug) => store.wishlist.includes(slug),
    saveOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return value;
}
