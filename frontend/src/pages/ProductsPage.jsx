import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { EmptyState, IntegrationNote, LoadingState } from "../components/Feedback.jsx";
import { firstVariant } from "../lib/helpers.js";
import { useCatalog } from "../lib/useCatalog.js";

function applyFilters(products, searchParams) {
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const goal = searchParams.get("goal") || "";
  const maxPrice = Number(searchParams.get("maxPrice") || 100000);
  const sort = searchParams.get("sort") || "featured";

  const filtered = products.filter((product) => {
    const variant = firstVariant(product);
    const searchable = `${product.brand} ${product.name} ${product.category} ${variant.flavour}`.toLowerCase();
    return (
      (!search || searchable.includes(search)) &&
      (!category || product.category === category) &&
      (!brand || product.brand === brand) &&
      (!goal || product.goal === goal) &&
      variant.price <= maxPrice
    );
  });

  const sorted = [...filtered];
  if (sort === "price-asc") {
    sorted.sort((left, right) => firstVariant(left).price - firstVariant(right).price);
  } else if (sort === "price-desc") {
    sorted.sort((left, right) => firstVariant(right).price - firstVariant(left).price);
  } else if (sort === "rating-desc") {
    sorted.sort((left, right) => right.ratingAverage - left.ratingAverage);
  } else if (sort === "discount-desc") {
    sorted.sort((left, right) => {
      const leftDiscount = firstVariant(left).mrp - firstVariant(left).price;
      const rightDiscount = firstVariant(right).mrp - firstVariant(right).price;
      return rightDiscount - leftDiscount;
    });
  } else {
    sorted.sort((left, right) => right.ratingCount - left.ratingCount);
  }

  return sorted;
}

export default function ProductsPage() {
  const { products, mode, loading } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const filteredProducts = applyFilters(products, searchParams);
  const maxPrice = searchParams.get("maxPrice") || "9000";

  function updateParam(name, value) {
    const nextParams = new URLSearchParams(searchParams);
    if (!value) {
      nextParams.delete(name);
    } else {
      nextParams.set(name, value);
    }
    setSearchParams(nextParams);
  }

  return (
    <div className="shell">
      <section className="section-intro">
        <p className="eyebrow">Full catalog</p>
        <h1>All Products</h1>
        <p className="muted">Filter by category, brand, goal, and price while the product grid stays ready for backend hydration.</p>
      </section>

      <section className="product-page-layout">
        <aside className="filters-panel">
          <h2>Filters</h2>
          <form className="filter-stack" onSubmit={(event) => event.preventDefault()}>
            <label className="field">
              <span>Category</span>
              <select
                value={searchParams.get("category") || ""}
                onChange={(event) => updateParam("category", event.target.value)}
              >
                <option value="">All categories</option>
                <option value="whey-protein">Whey Protein</option>
                <option value="creatine">Creatine</option>
                <option value="mass-gainers">Mass Gainers</option>
                <option value="vitamins">Vitamins</option>
                <option value="pre-workout">Pre-Workout</option>
                <option value="amino-acids">Amino Acids</option>
              </select>
            </label>
            <label className="field">
              <span>Brand</span>
              <select
                value={searchParams.get("brand") || ""}
                onChange={(event) => updateParam("brand", event.target.value)}
              >
                <option value="">All brands</option>
                <option value="MuscleBlaze">MuscleBlaze</option>
                <option value="Optimum Nutrition">Optimum Nutrition</option>
                <option value="AS-IT-IS">AS-IT-IS</option>
                <option value="MuscleTech">MuscleTech</option>
                <option value="GNC">GNC</option>
                <option value="MyProtein">MyProtein</option>
                <option value="Dymatize">Dymatize</option>
              </select>
            </label>
            <label className="field">
              <span>Goal</span>
              <select
                value={searchParams.get("goal") || ""}
                onChange={(event) => updateParam("goal", event.target.value)}
              >
                <option value="">All goals</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="endurance">Endurance and Stamina</option>
              </select>
            </label>
            <label className="field">
              <span>Search</span>
              <input
                type="search"
                placeholder="Brand or product"
                value={searchParams.get("search") || ""}
                onChange={(event) => updateParam("search", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Price Range</span>
              <input
                type="range"
                min="500"
                max="9000"
                step="100"
                value={maxPrice}
                onChange={(event) => updateParam("maxPrice", event.target.value)}
              />
              <small>Up to Rs. {Number(maxPrice).toLocaleString("en-IN")}</small>
            </label>
            <label className="field">
              <span>Sort By</span>
              <select
                value={searchParams.get("sort") || "featured"}
                onChange={(event) => updateParam("sort", event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating</option>
                <option value="discount-desc">Discount</option>
              </select>
            </label>
          </form>
        </aside>

        <section>
          {mode !== "api" ? (
            <IntegrationNote
              title="Demo catalog active"
              copy="Connect GET /api/products to replace seed product data without changing the frontend."
              variant="warning"
            />
          ) : null}

          <div className="results-toolbar">
            <strong>{filteredProducts.length} products</strong>
            <p className="muted">Sidebar filters mirror the planned category, brand, price, goal, and sort setup.</p>
          </div>

          {loading ? (
            <LoadingState title="Loading products..." />
          ) : filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} variant={firstVariant(product)} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products matched"
              copy="Try widening price or clearing one of the filters to reveal more products."
              href="/products"
              label="Reset Filters"
            />
          )}
        </section>
      </section>
    </div>
  );
}
