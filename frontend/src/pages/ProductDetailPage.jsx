import { Link, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { findVariant } from "../../js/storage.js";
import { formatCurrency } from "../../js/ui.js";
import { useStore } from "../context/StoreContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { EmptyState, IntegrationNote, LoadingState } from "../components/Feedback.jsx";
import { firstVariant } from "../lib/helpers.js";
import { useCatalog } from "../lib/useCatalog.js";

export default function ProductDetailPage({ legacy = false }) {
  const { products, mode, loading } = useCatalog();
  const { slug: routeSlug } = useParams();
  const location = useLocation();
  const requestedSlug = legacy
    ? new URLSearchParams(location.search).get("slug") || "biozyme-whey"
    : routeSlug;
  const product = products.find((item) => item.slug === requestedSlug) || null;
  const relatedProducts = products.filter((item) => item.slug !== requestedSlug).slice(0, 3);
  const { addToCart, isWishlisted, toggleWishlist } = useStore();

  const [activeVariantId, setActiveVariantId] = useState(product?.variants[0]?.id || "");
  const [qty, setQty] = useState(1);

  if (loading) {
    return (
      <div className="shell">
        <section className="section">
          <LoadingState title="Loading product..." />
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="shell">
        <section className="section">
          <EmptyState
            title="Product not found"
            copy="The requested product slug is not present in the current catalog."
            href="/products"
            label="Back to shop"
          />
        </section>
      </div>
    );
  }

  const activeVariant = findVariant(product, activeVariantId || product.variants[0].id);
  const currentFlavour = activeVariant.flavour;
  const flavourOptions = [...new Set(product.variants.map((variant) => variant.flavour))];
  const sizeVariants = product.variants.filter((variant) => variant.flavour === currentFlavour);
  const wishlisted = isWishlisted(product.slug);

  return (
    <div className="shell">
      <section className="section">
        {mode !== "api" ? (
          <IntegrationNote
            title="Seed product mode"
            copy="Connect GET /api/products/:slug or expand the catalog API when the backend is ready."
            variant="warning"
          />
        ) : null}

        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category.replace(/-/g, " ")}</Link>
          <span>/</span>
          <span>{product.shortName}</span>
        </div>

        <section className="product-detail-layout">
          <div className="product-detail__gallery">
            <img src={product.image} alt={product.name} />
            <div className="product-thumb-row">
              <button type="button" className="thumb is-active">Front</button>
              <button type="button" className="thumb">Label</button>
              <button type="button" className="thumb">Facts</button>
              <button type="button" className="thumb">Pack</button>
            </div>
          </div>

          <div className="product-detail__content">
            <p className="eyebrow">{product.brand}</p>
            <h1>{product.name}</h1>
            <p className="product-card__rating">
              {product.ratingAverage.toFixed(1)} rating · {product.ratingCount.toLocaleString("en-IN")} reviews
            </p>
            <div className="price-row price-row--large">
              <strong>{formatCurrency(activeVariant.price)}</strong>
              <span>{formatCurrency(activeVariant.mrp)}</span>
            </div>
            <p>{product.description}</p>

            <div className="detail-field">
              <label htmlFor="flavour-select">Flavour</label>
              <select
                id="flavour-select"
                value={currentFlavour}
                onChange={(event) => {
                  const nextVariant = product.variants.find((variant) => variant.flavour === event.target.value);
                  if (nextVariant) {
                    setActiveVariantId(nextVariant.id);
                  }
                }}
              >
                {flavourOptions.map((flavour) => (
                  <option key={flavour} value={flavour}>{flavour}</option>
                ))}
              </select>
            </div>

            <div className="detail-field">
              <span>Size</span>
              <div className="size-chip-row">
                {sizeVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`size-chip ${variant.id === activeVariant.id ? "is-active" : ""}`}
                    onClick={() => setActiveVariantId(variant.id)}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-field detail-field--inline">
              <span>Quantity</span>
              <div className="qty-picker">
                <button type="button" onClick={() => setQty((current) => Math.max(1, current - 1))}>-</button>
                <strong>{qty}</strong>
                <button type="button" onClick={() => setQty((current) => current + 1)}>+</button>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  addToCart(product, activeVariant.id, qty);
                  setQty(1);
                }}
              >
                Add to Cart
              </button>
              <button
                className={`button button--ghost wishlist-button ${wishlisted ? "is-active" : ""}`}
                type="button"
                onClick={() => toggleWishlist(product.slug)}
              >
                {wishlisted ? "Saved" : "Save"}
              </button>
            </div>

            <div className="feature-line-list">
              <p>Lab tested</p>
              <p>Authenticity-first sourcing</p>
              <p>Free delivery above Rs. 999</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="tab-panel-grid">
            <article className="tab-panel">
              <h3>Description</h3>
              <p>{product.description}</p>
              <ul>
                {product.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className="tab-panel">
              <h3>Nutrition Facts</h3>
              <ul>
                {product.nutritionFacts.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className="tab-panel">
              <h3>Lab Report</h3>
              <p>Frontend link is ready. Replace <code>{product.labReportUrl}</code> once report files are uploaded.</p>
              <a className="button button--ghost" href={product.labReportUrl}>Attach Lab Report</a>
            </article>
            <article className="tab-panel">
              <h3>Reviews</h3>
              <p>{product.ratingAverage.toFixed(1)} rating across {product.ratingCount.toLocaleString("en-IN")} verified review signals.</p>
              <p>Detailed review API can be connected later to hydrate this panel from MongoDB.</p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Related picks</p>
              <h2>You may also like</h2>
            </div>
            <Link className="button button--ghost" to="/products">View all</Link>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} variant={firstVariant(item)} />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
