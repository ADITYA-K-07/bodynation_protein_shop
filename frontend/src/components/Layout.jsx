import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { categories } from "../../js/data.js";
import { useStore } from "../context/StoreContext.jsx";

function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "is-active" : "")}
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlistCount } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  function onSearchSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }
    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    setMobileOpen(false);
  }

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-track">
          {[
            "FREE SHIPPING ABOVE RS. 999",
            "LAB TESTED AND 100% AUTHENTIC",
            "4.5+ RATED BY 10,000+ CUSTOMERS",
            "2% OFF ON PREPAID ORDERS",
            "FREE SHIPPING ABOVE RS. 999",
            "LAB TESTED AND 100% AUTHENTIC",
            "4.5+ RATED BY 10,000+ CUSTOMERS",
            "2% OFF ON PREPAID ORDERS",
          ].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <header className="site-header">
        <div className="shell shell--header">
          <NavLink className="brand-lockup" to="/" aria-label="Body Nation home">
            <img src="/assets/logo/bodynation-light.svg" alt="Body Nation" />
          </NavLink>

          <form className="site-search" onSubmit={onSearchSubmit}>
            <label className="sr-only" htmlFor="category-select">Category</label>
            <select
              id="category-select"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="search-input">Search products</label>
            <input
              id="search-input"
              name="search"
              type="search"
              placeholder="Search whey, creatine, vitamins..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" className="button button--primary">Search</button>
          </form>

          <button
            className="mobile-nav-toggle"
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            Menu
          </button>

          <div className="header-actions">
            <NavLink to="/products" className="header-chip">
              Wishlist <span>{wishlistCount}</span>
            </NavLink>
            <NavLink to="/cart" className="header-chip">
              Cart <span>{cartCount}</span>
            </NavLink>
          </div>
        </div>

        <nav className={`primary-nav ${mobileOpen ? "is-open" : ""}`}>
          <HeaderLink to="/">Home</HeaderLink>
          <HeaderLink to="/products">Shop</HeaderLink>
          <NavLink to="/products?goal=muscle-gain">Goals</NavLink>
          <NavLink to="/products?sort=rating-desc">Brands</NavLink>
          <NavLink to="/contact#bulk-orders">Bulk Orders</NavLink>
          <NavLink to="/about#lab-reports">Lab Reports</NavLink>
          <HeaderLink to="/about">About Us</HeaderLink>
          <HeaderLink to="/contact">Contact</HeaderLink>
        </nav>
      </header>

      <main key={location.pathname}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <img src="/assets/logo/bodynation-dark.svg" alt="Body Nation" />
            <p>Your trusted supplement store. Lab tested, authentic-focused, and ready for scale.</p>
            <a href="mailto:support@bodynation.in">support@bodynation.in</a>
            <a href="tel:+910000000000">+91 00000 00000</a>
          </div>
          <div>
            <h3>Quick Links</h3>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Shop</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          <div>
            <h3>Categories</h3>
            {categories.slice(0, 5).map((item) => (
              <NavLink key={item.slug} to={`/products?category=${item.slug}`}>
                {item.name}
              </NavLink>
            ))}
          </div>
          <div>
            <h3>Follow</h3>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
            <a href="#">Facebook</a>
            <a href="#">X</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Body Nation. All rights reserved.</p>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </>
  );
}
