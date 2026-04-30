import { Link } from "react-router-dom";
import { calculateDiscount, formatCurrency } from "../../js/ui.js";
import { useStore } from "../context/StoreContext.jsx";

function badgeTone(label) {
  const normalized = label.toLowerCase();
  if (normalized.includes("lab")) {
    return "success";
  }
  if (normalized.includes("sale")) {
    return "warning";
  }
  if (normalized.includes("new")) {
    return "info";
  }
  return "dark";
}

export default function ProductCard({ product, variant }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const wishlisted = isWishlisted(product.slug);
  const discount = calculateDiscount(variant.price, variant.mrp);

  return (
    <article className={`product-card product-card--${product.color}`}>
      <div className="product-card__media">
        <div className="product-card__badges">
          {product.badges.map((badge) => (
            <span key={badge} className={`badge badge--${badgeTone(badge)}`}>{badge}</span>
          ))}
        </div>
        <button
          className={`wishlist-button ${wishlisted ? "is-active" : ""}`}
          type="button"
          aria-pressed={wishlisted}
          aria-label={`Toggle wishlist for ${product.name}`}
          onClick={() => toggleWishlist(product.slug)}
        >
          {wishlisted ? "Saved" : "Save"}
        </button>
        <Link to={`/product/${product.slug}`} className="product-card__image-link">
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
      </div>
      <div className="product-card__body">
        <p className="product-card__brand">{product.brand}</p>
        <h3 className="product-card__name">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card__meta">{variant.flavour} · {variant.size}</p>
        <p className="product-card__rating">
          {product.ratingAverage.toFixed(1)} rating · {product.ratingCount.toLocaleString("en-IN")} reviews
        </p>
        <div className="price-row">
          <strong>{formatCurrency(variant.price)}</strong>
          <span>{formatCurrency(variant.mrp)}</span>
          <em>{discount}% off</em>
        </div>
        <div className="product-card__actions">
          <button
            className="button button--dark"
            type="button"
            onClick={() => addToCart(product, variant.id, 1)}
          >
            Add to Cart
          </button>
          <Link className="button button--ghost" to={`/product/${product.slug}`}>View</Link>
        </div>
      </div>
    </article>
  );
}
