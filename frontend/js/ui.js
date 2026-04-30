export function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function calculateDiscount(price, mrp) {
  if (!mrp || mrp <= price) {
    return 0;
  }
  return Math.round(((mrp - price) / mrp) * 100);
}

export function badgeMarkup(label) {
  const tone = label.toLowerCase().includes("lab")
    ? "success"
    : label.toLowerCase().includes("sale")
      ? "warning"
      : label.toLowerCase().includes("new")
        ? "info"
        : "dark";

  return `<span class="badge badge--${tone}">${label}</span>`;
}

export function emptyStateMarkup(title, copy, href, label) {
  return `
    <div class="empty-state">
      <p class="eyebrow">Body Nation</p>
      <h2>${title}</h2>
      <p>${copy}</p>
      <a class="button button--primary" href="${href}">${label}</a>
    </div>
  `;
}

export function productCardMarkup(product, variant, wishlisted = false) {
  const discount = calculateDiscount(variant.price, variant.mrp);
  return `
    <article class="product-card product-card--${product.color}">
      <div class="product-card__media">
        <div class="product-card__badges">
          ${product.badges.map((badge) => badgeMarkup(badge)).join("")}
        </div>
        <button
          class="wishlist-button ${wishlisted ? "is-active" : ""}"
          type="button"
          data-wishlist-toggle="${product.slug}"
          aria-pressed="${wishlisted ? "true" : "false"}"
          aria-label="Toggle wishlist for ${product.name}"
        >
          ${wishlisted ? "Saved" : "Save"}
        </button>
        <a href="product-detail.html?slug=${product.slug}" class="product-card__image-link">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </a>
      </div>
      <div class="product-card__body">
        <p class="product-card__brand">${product.brand}</p>
        <h3 class="product-card__name">
          <a href="product-detail.html?slug=${product.slug}">${product.name}</a>
        </h3>
        <p class="product-card__meta">${variant.flavour} · ${variant.size}</p>
        <p class="product-card__rating">${product.ratingAverage.toFixed(1)} rating · ${product.ratingCount.toLocaleString("en-IN")} reviews</p>
        <div class="price-row">
          <strong>${formatCurrency(variant.price)}</strong>
          <span>${formatCurrency(variant.mrp)}</span>
          <em>${discount}% off</em>
        </div>
        <div class="product-card__actions">
          <button
            class="button button--dark"
            type="button"
            data-add-to-cart="${product.slug}"
            data-variant-id="${variant.id}"
          >
            Add to Cart
          </button>
          <a class="button button--ghost" href="product-detail.html?slug=${product.slug}">View</a>
        </div>
      </div>
    </article>
  `;
}

export function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

export function integrationNoteMarkup(title, copy, variant = "info") {
  return `
    <div class="integration-note integration-note--${variant}">
      <p class="integration-note__title">${title}</p>
      <p>${copy}</p>
    </div>
  `;
}
