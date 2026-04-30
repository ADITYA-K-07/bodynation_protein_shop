import { getProductBySlug, getCatalog } from "./catalog.js";
import { addToCart, isWishlisted } from "./storage.js";
import { emptyStateMarkup, formatCurrency, integrationNoteMarkup, productCardMarkup } from "./ui.js";

const params = new URLSearchParams(window.location.search);
const requestedSlug = params.get("slug") || "biozyme-whey";

const state = {
  qty: 1,
  activeVariantId: "",
};

function renderVariantOptions(product) {
  const flavourSelect = document.querySelector("[data-flavour-select]");
  const sizeList = document.querySelector("[data-size-options]");
  if (!flavourSelect || !sizeList) {
    return;
  }

  const flavours = [...new Set(product.variants.map((variant) => variant.flavour))];
  flavourSelect.innerHTML = flavours
    .map(
      (flavour) =>
        `<option value="${flavour}" ${product.variants.find((variant) => variant.id === state.activeVariantId)?.flavour === flavour ? "selected" : ""}>${flavour}</option>`
    )
    .join("");

  const currentFlavour = flavourSelect.value || flavours[0];
  const sizeVariants = product.variants.filter((variant) => variant.flavour === currentFlavour);

  if (!sizeVariants.some((variant) => variant.id === state.activeVariantId)) {
    state.activeVariantId = sizeVariants[0].id;
  }

  sizeList.innerHTML = sizeVariants
    .map(
      (variant) => `
        <button
          type="button"
          class="size-chip ${variant.id === state.activeVariantId ? "is-active" : ""}"
          data-size-option="${variant.id}"
        >
          ${variant.size}
        </button>
      `
    )
    .join("");
}

function renderTabs(product) {
  const mount = document.querySelector("[data-product-tabs]");
  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <div class="tab-panel-grid">
      <article class="tab-panel">
        <h3>Description</h3>
        <p>${product.description}</p>
        <ul>${product.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}</ul>
      </article>
      <article class="tab-panel">
        <h3>Nutrition Facts</h3>
        <ul>${product.nutritionFacts.map((fact) => `<li>${fact}</li>`).join("")}</ul>
      </article>
      <article class="tab-panel">
        <h3>Lab Report</h3>
        <p>Frontend link is ready. Replace <code>${product.labReportUrl}</code> once report files are uploaded.</p>
        <a class="button button--ghost" href="${product.labReportUrl}">Attach Lab Report</a>
      </article>
      <article class="tab-panel">
        <h3>Reviews</h3>
        <p>${product.ratingAverage.toFixed(1)} rating across ${product.ratingCount.toLocaleString("en-IN")} verified review signals.</p>
        <p>Detailed review API can be connected later to hydrate this panel from MongoDB.</p>
      </article>
    </div>
  `;
}

function renderProduct(product, relatedProducts, mode) {
  const mount = document.querySelector("[data-product-detail]");
  if (!mount) {
    return;
  }

  if (!product) {
    mount.innerHTML = emptyStateMarkup(
      "Product not found",
      "The requested product slug is not present in the current catalog.",
      "products.html",
      "Back to shop"
    );
    return;
  }

  if (!state.activeVariantId) {
    state.activeVariantId = product.variants[0].id;
  }

  const activeVariant =
    product.variants.find((variant) => variant.id === state.activeVariantId) ||
    product.variants[0];

  mount.innerHTML = `
    ${mode !== "api"
      ? integrationNoteMarkup(
          "Seed product mode",
          "Connect GET /api/products/:slug or expand the catalog API when the backend is ready.",
          "warning"
        )
      : ""}
    <div class="breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="products.html?category=${product.category}">${product.category.replace(/-/g, " ")}</a>
      <span>/</span>
      <span>${product.shortName}</span>
    </div>
    <section class="product-detail-layout">
      <div class="product-detail__gallery">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-thumb-row">
          <button type="button" class="thumb is-active">Front</button>
          <button type="button" class="thumb">Label</button>
          <button type="button" class="thumb">Facts</button>
          <button type="button" class="thumb">Pack</button>
        </div>
      </div>
      <div class="product-detail__content">
        <p class="eyebrow">${product.brand}</p>
        <h1>${product.name}</h1>
        <p class="product-card__rating">${product.ratingAverage.toFixed(1)} rating · ${product.ratingCount.toLocaleString("en-IN")} reviews</p>
        <div class="price-row price-row--large">
          <strong>${formatCurrency(activeVariant.price)}</strong>
          <span>${formatCurrency(activeVariant.mrp)}</span>
        </div>
        <p>${product.description}</p>
        <div class="detail-field">
          <label for="flavour-select">Flavour</label>
          <select id="flavour-select" data-flavour-select></select>
        </div>
        <div class="detail-field">
          <span>Size</span>
          <div class="size-chip-row" data-size-options></div>
        </div>
        <div class="detail-field detail-field--inline">
          <span>Quantity</span>
          <div class="qty-picker">
            <button type="button" data-qty-decrease>-</button>
            <strong data-qty-value>${state.qty}</strong>
            <button type="button" data-qty-increase>+</button>
          </div>
        </div>
        <div class="detail-actions">
          <button class="button button--primary" type="button" data-detail-add-to-cart>Add to Cart</button>
          <button
            class="button button--ghost wishlist-button ${isWishlisted(product.slug) ? "is-active" : ""}"
            type="button"
            data-wishlist-toggle="${product.slug}"
          >
            ${isWishlisted(product.slug) ? "Saved" : "Save"}
          </button>
        </div>
        <div class="feature-line-list">
          <p>Lab tested</p>
          <p>Authenticity-first sourcing</p>
          <p>Free delivery above Rs. 999</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div data-product-tabs></div>
    </section>
    <section class="section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Related picks</p>
          <h2>You may also like</h2>
        </div>
        <a class="button button--ghost" href="products.html">View all</a>
      </div>
      <div class="product-grid">
        ${relatedProducts
          .map((related) =>
            productCardMarkup(related, related.variants[0], isWishlisted(related.slug))
          )
          .join("")}
      </div>
    </section>
  `;

  renderVariantOptions(product);
  renderTabs(product);

  document.querySelector("[data-flavour-select]")?.addEventListener("change", (event) => {
    const selectedFlavour = event.target.value;
    const matchingVariant = product.variants.find(
      (variant) => variant.flavour === selectedFlavour
    );
    if (matchingVariant) {
      state.activeVariantId = matchingVariant.id;
      renderProduct(product, relatedProducts, mode);
    }
  });

  document.querySelectorAll("[data-size-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const variantId = button.getAttribute("data-size-option");
      if (variantId) {
        state.activeVariantId = variantId;
        renderProduct(product, relatedProducts, mode);
      }
    });
  });

  document.querySelector("[data-qty-decrease]")?.addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    renderProduct(product, relatedProducts, mode);
  });

  document.querySelector("[data-qty-increase]")?.addEventListener("click", () => {
    state.qty += 1;
    renderProduct(product, relatedProducts, mode);
  });

  document.querySelector("[data-detail-add-to-cart]")?.addEventListener("click", () => {
    addToCart(product, state.activeVariantId, state.qty);
    state.qty = 1;
    renderProduct(product, relatedProducts, mode);
  });
}

const [{ product, mode }, relatedCatalog] = await Promise.all([
  getProductBySlug(requestedSlug),
  getCatalog(),
]);

const relatedProducts = relatedCatalog.products
  .filter((item) => item.slug !== requestedSlug)
  .slice(0, 3);

renderProduct(product, relatedProducts, mode);
