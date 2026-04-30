import {
  announcementItems,
  authenticityPoints,
  brands,
  categories,
  goals,
  heroSlides,
  reviews,
  trustPoints,
} from "./data.js";
import { getCartCount, getWishlistCount } from "./storage.js";

function currentPageName() {
  const pathname = window.location.pathname.split("/").pop();
  return pathname || "index.html";
}

function navLinkClass(href) {
  return currentPageName() === href ? "is-active" : "";
}

function headerMarkup() {
  const categoryOptions = categories
    .map((category) => `<option value="${category.slug}">${category.name}</option>`)
    .join("");

  return `
    <div class="announcement-bar">
      <div class="announcement-track">
        ${[...announcementItems, ...announcementItems]
          .map((item) => `<span>${item}</span>`)
          .join("")}
      </div>
    </div>
    <header class="site-header">
      <div class="shell shell--header">
        <a class="brand-lockup" href="index.html" aria-label="Body Nation home">
          <img src="assets/logo/bodynation-light.svg" alt="Body Nation">
        </a>
        <form class="site-search" data-site-search>
          <label class="sr-only" for="category-select">Category</label>
          <select id="category-select" name="category">
            <option value="">All Categories</option>
            ${categoryOptions}
          </select>
          <label class="sr-only" for="search-input">Search products</label>
          <input id="search-input" name="search" type="search" placeholder="Search whey, creatine, vitamins...">
          <button type="submit" class="button button--primary">Search</button>
        </form>
        <button class="mobile-nav-toggle" type="button" data-mobile-nav-toggle aria-expanded="false">
          Menu
        </button>
        <div class="header-actions">
          <a href="products.html" class="header-chip">Wishlist <span data-wishlist-count>0</span></a>
          <a href="cart.html" class="header-chip">Cart <span data-cart-count>0</span></a>
        </div>
      </div>
      <nav class="primary-nav" data-primary-nav>
        <a class="${navLinkClass("index.html")}" href="index.html">Home</a>
        <a class="${navLinkClass("products.html")}" href="products.html">Shop</a>
        <a href="products.html?goal=muscle-gain">Goals</a>
        <a href="products.html?sort=rating-desc">Brands</a>
        <a href="contact.html#bulk-orders">Bulk Orders</a>
        <a href="about.html#lab-reports">Lab Reports</a>
        <a class="${navLinkClass("about.html")}" href="about.html">About Us</a>
        <a class="${navLinkClass("contact.html")}" href="contact.html">Contact</a>
      </nav>
    </header>
  `;
}

function footerMarkup() {
  const categoryLinks = categories
    .slice(0, 5)
    .map(
      (category) =>
        `<a href="products.html?category=${category.slug}">${category.name}</a>`
    )
    .join("");

  return `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div>
          <img src="assets/logo/bodynation-dark.svg" alt="Body Nation">
          <p>Your trusted supplement store. Lab tested, authentic-focused, and ready for scale.</p>
          <a href="mailto:support@bodynation.in">support@bodynation.in</a>
          <a href="tel:+910000000000">+91 00000 00000</a>
        </div>
        <div>
          <h3>Quick Links</h3>
          <a href="index.html">Home</a>
          <a href="products.html">Shop</a>
          <a href="about.html">About Us</a>
          <a href="contact.html">Contact</a>
        </div>
        <div>
          <h3>Categories</h3>
          ${categoryLinks}
        </div>
        <div>
          <h3>Follow</h3>
          <a href="#">Instagram</a>
          <a href="#">YouTube</a>
          <a href="#">Facebook</a>
          <a href="#">X</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Body Nation. All rights reserved.</p>
        <a href="#">Privacy Policy</a>
      </div>
    </footer>
  `;
}

function renderHeroSlider() {
  const mount = document.querySelector("[data-hero-slider]");
  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <div class="hero-slider">
      ${heroSlides
        .map(
          (slide, index) => `
            <article class="hero-slide ${index === 0 ? "is-active" : ""}" data-hero-slide="${index}">
              <div class="hero-slide__content">
                <p class="eyebrow">${slide.eyebrow}</p>
                <h1>${slide.title}</h1>
                <p>${slide.subtitle}</p>
                <a class="button button--primary" href="product-detail.html?slug=${slide.productSlug}">${slide.cta}</a>
              </div>
              <div class="hero-slide__visual">
                <img src="${slide.image}" alt="${slide.title}">
              </div>
            </article>
          `
        )
        .join("")}
      <div class="hero-slider__controls">
        <div class="hero-slider__dots">
          ${heroSlides
            .map(
              (_, index) =>
                `<button class="${index === 0 ? "is-active" : ""}" type="button" data-hero-dot="${index}" aria-label="Go to slide ${index + 1}"></button>`
            )
            .join("")}
        </div>
        <div class="hero-slider__buttons">
          <button type="button" data-hero-prev>Prev</button>
          <button type="button" data-hero-next>Next</button>
        </div>
      </div>
    </div>
  `;

  const slides = Array.from(mount.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(mount.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;

  function applySlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  mount.querySelector("[data-hero-prev]")?.addEventListener("click", () => applySlide(activeIndex - 1));
  mount.querySelector("[data-hero-next]")?.addEventListener("click", () => applySlide(activeIndex + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => applySlide(index));
  });

  window.setInterval(() => applySlide(activeIndex + 1), 5000);
}

function renderCategories() {
  const mount = document.querySelector("[data-category-cards]");
  if (!mount) {
    return;
  }

  mount.innerHTML = categories
    .map(
      (category) => `
        <a class="category-card" href="products.html?category=${category.slug}">
          <span>${category.tag}</span>
          <strong>${category.name}</strong>
          <p>${category.description}</p>
        </a>
      `
    )
    .join("");
}

function renderGoals() {
  const mount = document.querySelector("[data-goal-cards]");
  if (!mount) {
    return;
  }

  mount.innerHTML = goals
    .map(
      (goal) => `
        <article class="goal-card goal-card--${goal.slug}">
          <p class="eyebrow">Train With Purpose</p>
          <h3>${goal.title}</h3>
          <p>${goal.copy}</p>
          <a href="products.html?goal=${goal.slug}">${goal.cta}</a>
        </article>
      `
    )
    .join("");
}

function renderBrands() {
  const mount = document.querySelector("[data-brand-track]");
  if (!mount) {
    return;
  }

  const repeatedBrands = [...brands, ...brands];
  mount.innerHTML = repeatedBrands.map((brand) => `<span>${brand}</span>`).join("");
}

function renderTrustBlocks() {
  const trustMount = document.querySelector("[data-trust-grid]");
  if (trustMount) {
    trustMount.innerHTML = trustPoints
      .map(
        (point) => `
          <article class="mini-trust-card">
            <span>${point.tag}</span>
            <h3>${point.title}</h3>
            <p>${point.copy}</p>
          </article>
        `
      )
      .join("");
  }

  const authenticMount = document.querySelector("[data-auth-points]");
  if (authenticMount) {
    authenticMount.innerHTML = authenticityPoints
      .map((point) => `<li>${point}</li>`)
      .join("");
  }
}

function renderReviews() {
  const mount = document.querySelector("[data-review-grid]");
  if (!mount) {
    return;
  }

  mount.innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-card__top">
            <span>${review.initials}</span>
            <p>${review.rating} / 5 rating</p>
          </div>
          <p>${review.text}</p>
          <strong>${review.name}</strong>
          <small>Verified buyer · ${review.product}</small>
        </article>
      `
    )
    .join("");
}

function updateChromeCounts() {
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(getCartCount());
  });

  document.querySelectorAll("[data-wishlist-count]").forEach((node) => {
    node.textContent = String(getWishlistCount());
  });
}

function bindSearch() {
  const form = document.querySelector("[data-site-search]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const params = new URLSearchParams();
    const category = String(formData.get("category") || "");
    const search = String(formData.get("search") || "");

    if (category) {
      params.set("category", category);
    }
    if (search) {
      params.set("search", search);
    }

    window.location.href = `products.html${params.toString() ? `?${params.toString()}` : ""}`;
  });
}

function bindMobileNav() {
  const button = document.querySelector("[data-mobile-nav-toggle]");
  const nav = document.querySelector("[data-primary-nav]");
  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
}

function renderShell() {
  const headerMount = document.querySelector("[data-site-header]");
  const footerMount = document.querySelector("[data-site-footer]");
  if (headerMount) {
    headerMount.innerHTML = headerMarkup();
  }
  if (footerMount) {
    footerMount.innerHTML = footerMarkup();
  }
}

renderShell();
renderHeroSlider();
renderCategories();
renderGoals();
renderBrands();
renderTrustBlocks();
renderReviews();
updateChromeCounts();
bindSearch();
bindMobileNav();

window.addEventListener("bodynation:cart-updated", updateChromeCounts);
window.addEventListener("bodynation:wishlist-updated", updateChromeCounts);
