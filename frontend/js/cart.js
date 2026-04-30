import { getCatalog } from "./catalog.js";
import { buildCartDetails, removeFromCart, updateCartItemQty } from "./storage.js";
import { emptyStateMarkup, formatCurrency, integrationNoteMarkup } from "./ui.js";

function cartRowMarkup(item) {
  return `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item__body">
        <h3>${item.shortName}</h3>
        <p>${item.brand} · ${item.flavour} · ${item.size}</p>
        <strong>${formatCurrency(item.price)}</strong>
      </div>
      <div class="cart-item__controls">
        <div class="qty-picker">
          <button type="button" data-qty-change="${item.slug}" data-variant-id="${item.variantId}" data-next-qty="${item.qty - 1}">-</button>
          <strong>${item.qty}</strong>
          <button type="button" data-qty-change="${item.slug}" data-variant-id="${item.variantId}" data-next-qty="${item.qty + 1}">+</button>
        </div>
        <button class="text-button" type="button" data-remove-item="${item.slug}" data-variant-id="${item.variantId}">Remove</button>
      </div>
    </article>
  `;
}

function renderSummary(summary) {
  const mount = document.querySelector("[data-cart-summary]");
  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <div class="summary-card">
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(summary.subtotal)}</strong></div>
      <div class="summary-row"><span>Savings</span><strong>${formatCurrency(summary.discount)}</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>${summary.shipping === 0 ? "Free" : formatCurrency(summary.shipping)}</strong></div>
      <div class="summary-row summary-row--total"><span>Total</span><strong>${formatCurrency(summary.total)}</strong></div>
      <a class="button button--primary button--block" href="checkout.html">Proceed to Checkout</a>
      <a class="button button--ghost button--block" href="products.html">Continue Shopping</a>
      <label class="field">
        <span>Coupon code</span>
        <div class="field-inline">
          <input type="text" placeholder="Offer codes connect later">
          <button type="button" class="button button--dark">Apply</button>
        </div>
      </label>
    </div>
  `;
}

function bindCartActions(products) {
  document.addEventListener("click", (event) => {
    const qtyButton = event.target.closest("[data-qty-change]");
    if (qtyButton) {
      const slug = qtyButton.getAttribute("data-qty-change");
      const variantId = qtyButton.getAttribute("data-variant-id");
      const nextQty = Number(qtyButton.getAttribute("data-next-qty"));
      if (slug && variantId) {
        updateCartItemQty(slug, variantId, nextQty);
        renderCart(products);
      }
      return;
    }

    const removeButton = event.target.closest("[data-remove-item]");
    if (removeButton) {
      const slug = removeButton.getAttribute("data-remove-item");
      const variantId = removeButton.getAttribute("data-variant-id");
      if (slug && variantId) {
        removeFromCart(slug, variantId);
        renderCart(products);
      }
    }
  });
}

function renderCart(products, mode = "seed") {
  const mount = document.querySelector("[data-cart-items]");
  if (!mount) {
    return;
  }

  const summary = buildCartDetails(products);
  const status = document.querySelector("[data-cart-status]");
  if (status && mode !== "api") {
    status.innerHTML = integrationNoteMarkup(
      "Local cart mode",
      "Cart uses localStorage now and is ready to map to customer sessions or accounts later.",
      "warning"
    );
  }

  if (!summary.items.length) {
    mount.innerHTML = emptyStateMarkup(
      "Your cart is empty",
      "Start with best sellers or explore a goal-based collection to build your stack.",
      "products.html",
      "Browse Products"
    );
    const summaryMount = document.querySelector("[data-cart-summary]");
    if (summaryMount) {
      summaryMount.innerHTML = "";
    }
    return;
  }

  mount.innerHTML = summary.items.map((item) => cartRowMarkup(item)).join("");
  renderSummary(summary);
}

const catalog = await getCatalog();
renderCart(catalog.products, catalog.mode);
bindCartActions(catalog.products);
window.addEventListener("bodynation:cart-updated", () => renderCart(catalog.products, catalog.mode));
