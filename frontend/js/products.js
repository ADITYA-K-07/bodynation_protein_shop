import { getCatalog } from "./catalog.js";
import { addToCart, isWishlisted } from "./storage.js";
import { emptyStateMarkup, integrationNoteMarkup, productCardMarkup } from "./ui.js";

function normalizeCategoryLabel(slug) {
  return slug.replace(/-/g, " ");
}

function firstVariant(product) {
  return product.variants[0];
}

function applyFilters(products) {
  const params = new URLSearchParams(window.location.search);
  const search = (params.get("search") || "").trim().toLowerCase();
  const category = params.get("category") || "";
  const brand = params.get("brand") || "";
  const goal = params.get("goal") || "";
  const maxPrice = Number(params.get("maxPrice") || 100000);
  const sort = params.get("sort") || "featured";

  const filtered = products.filter((product) => {
    const variant = firstVariant(product);
    const searchable = `${product.brand} ${product.name} ${product.category} ${variant.flavour}`.toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesCategory = !category || product.category === category;
    const matchesBrand = !brand || product.brand === brand;
    const matchesGoal = !goal || product.goal === goal;
    const matchesPrice = variant.price <= maxPrice;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesGoal &&
      matchesPrice
    );
  });

  const sorted = [...filtered];
  switch (sort) {
    case "price-asc":
      sorted.sort((left, right) => firstVariant(left).price - firstVariant(right).price);
      break;
    case "price-desc":
      sorted.sort((left, right) => firstVariant(right).price - firstVariant(left).price);
      break;
    case "rating-desc":
      sorted.sort((left, right) => right.ratingAverage - left.ratingAverage);
      break;
    case "discount-desc":
      sorted.sort((left, right) => {
        const leftDiscount = firstVariant(left).mrp - firstVariant(left).price;
        const rightDiscount = firstVariant(right).mrp - firstVariant(right).price;
        return rightDiscount - leftDiscount;
      });
      break;
    default:
      sorted.sort((left, right) => right.ratingCount - left.ratingCount);
      break;
  }

  return { filtered: sorted, params };
}

function renderHomeBestSellers(products) {
  const mount = document.querySelector("[data-best-sellers-grid]");
  if (!mount) {
    return;
  }

  const featured = products
    .filter((product) => product.badges.some((badge) => badge.includes("BEST") || badge.includes("NEW") || badge.includes("SALE")))
    .slice(0, 4);

  mount.innerHTML = featured
    .map((product) => productCardMarkup(product, firstVariant(product), isWishlisted(product.slug)))
    .join("");
}

function bindProductInteractions(products) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) {
      return;
    }

    const slug = button.getAttribute("data-add-to-cart");
    const variantId = button.getAttribute("data-variant-id");
    const product = products.find((item) => item.slug === slug);
    if (!product || !variantId) {
      return;
    }

    addToCart(product, variantId, 1);
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add to Cart";
    }, 1200);
  });
}

function renderProductsPage(products, mode) {
  const grid = document.querySelector("[data-products-grid]");
  if (!grid) {
    return;
  }

  const status = document.querySelector("[data-products-status]");
  if (status && mode !== "api") {
    status.innerHTML = integrationNoteMarkup(
      "Demo catalog active",
      "Connect GET /api/products to replace seed product data without changing the frontend.",
      "warning"
    );
  }

  const { filtered, params } = applyFilters(products);
  const results = document.querySelector("[data-results-count]");
  if (results) {
    results.textContent = `${filtered.length} products`;
  }

  if (!filtered.length) {
    grid.innerHTML = emptyStateMarkup(
      "No products matched",
      "Try widening price or clearing one of the filters to reveal more products.",
      "products.html",
      "Reset Filters"
    );
    return;
  }

  grid.innerHTML = filtered
    .map((product) => productCardMarkup(product, firstVariant(product), isWishlisted(product.slug)))
    .join("");

  document.querySelectorAll("[data-filter-sync]").forEach((input) => {
    const key = input.getAttribute("name");
    if (!key) {
      return;
    }
    const value = params.get(key) || "";
    if (input.type === "range") {
      input.value = value || input.max;
      const output = document.querySelector("[data-price-output]");
      if (output) {
        output.textContent = `Up to Rs. ${Number(input.value).toLocaleString("en-IN")}`;
      }
    } else {
      input.value = value;
    }
  });
}

function bindFilterForm() {
  const form = document.querySelector("[data-filter-form]");
  if (!form) {
    return;
  }

  form.addEventListener("input", () => {
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (String(value)) {
        params.set(key, String(value));
      }
    }
    window.history.replaceState({}, "", `products.html?${params.toString()}`);
    window.dispatchEvent(new CustomEvent("bodynation:filters-changed"));
  });
}

const catalog = await getCatalog();
renderHomeBestSellers(catalog.products);
renderProductsPage(catalog.products, catalog.mode);
bindFilterForm();
bindProductInteractions(catalog.products);

window.addEventListener("bodynation:filters-changed", () => {
  renderProductsPage(catalog.products, catalog.mode);
});
