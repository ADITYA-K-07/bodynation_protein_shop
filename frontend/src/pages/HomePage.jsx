import { Link } from "react-router-dom";
import {
  authenticityPoints,
  brands,
  categories,
  goals,
  reviews,
  trustPoints,
} from "../../js/data.js";
import ProductCard from "../components/ProductCard.jsx";
import HeroSlider from "../components/HeroSlider.jsx";
import { LoadingState } from "../components/Feedback.jsx";
import { firstVariant } from "../lib/helpers.js";
import { useCatalog } from "../lib/useCatalog.js";

export default function HomePage() {
  const { products, loading } = useCatalog();
  const featured = products
    .filter((product) =>
      product.badges.some((badge) => badge.includes("BEST") || badge.includes("NEW") || badge.includes("SALE"))
    )
    .slice(0, 4);

  if (loading) {
    return (
      <div className="shell">
        <section className="section">
          <LoadingState />
        </section>
      </div>
    );
  }

  return (
    <>
      <section className="section">
        <div className="shell">
          <HeroSlider />
        </div>
      </section>

      <section className="section section--dark section--trust">
        <div className="shell">
          <div className="trust-grid">
            {trustPoints.map((point) => (
              <article key={point.tag} className="mini-trust-card">
                <span>{point.tag}</span>
                <h3>{point.title}</h3>
                <p>{point.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Start here</p>
              <h2>Shop by Category</h2>
            </div>
            <Link className="button button--ghost" to="/products">View All</Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category.slug} className="category-card" to={`/products?category=${category.slug}`}>
                <span>{category.tag}</span>
                <strong>{category.name}</strong>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Most wanted</p>
              <h2>Best Sellers</h2>
            </div>
            <Link className="button button--ghost" to="/products?sort=rating-desc">View All</Link>
          </div>
          <div className="product-grid product-grid--featured">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} variant={firstVariant(product)} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Goals first</p>
              <h2>Train With Purpose</h2>
            </div>
          </div>
          <div className="goal-grid">
            {goals.map((goal) => (
              <article key={goal.slug} className={`goal-card goal-card--${goal.slug}`}>
                <p className="eyebrow">Train With Purpose</p>
                <h3>{goal.title}</h3>
                <p>{goal.copy}</p>
                <Link to={`/products?goal=${goal.slug}`}>{goal.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Trusted labels</p>
              <h2>Top Brands We Carry</h2>
            </div>
          </div>
          <div className="brand-marquee">
            <div className="brand-track">
              {[...brands, ...brands].map((brand, index) => (
                <span key={`${brand}-${index}`}>{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="authentic-grid">
            <article className="authentic-hero">
              <p className="eyebrow">Trust signal</p>
              <h2>100% Authentic. <strong>Always.</strong></h2>
              <p>
                Body Nation is positioned around verified sourcing, transparent product storytelling,
                and a checkout flow that is ready for real payment verification when backend routes go live.
              </p>
            </article>
            <article className="authentic-points">
              <p className="eyebrow">What that means</p>
              <ul>
                {authenticityPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Member stories</p>
              <h2>What Our Members Say</h2>
            </div>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <article key={review.name} className="review-card">
                <div className="review-card__top">
                  <span>{review.initials}</span>
                  <p>{review.rating} / 5 rating</p>
                </div>
                <p>{review.text}</p>
                <strong>{review.name}</strong>
                <small>Verified buyer · {review.product}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
