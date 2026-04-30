import { Link } from "react-router-dom";
import { buildCartDetails } from "../../js/storage.js";
import { formatCurrency } from "../../js/ui.js";
import { useStore } from "../context/StoreContext.jsx";
import { EmptyState, IntegrationNote, LoadingState } from "../components/Feedback.jsx";
import { useCatalog } from "../lib/useCatalog.js";

export default function CartPage() {
  const { products, mode, loading } = useCatalog();
  const { removeFromCart, updateCartItemQty } = useStore();
  const summary = buildCartDetails(products);

  if (loading) {
    return (
      <div className="shell">
        <section className="section">
          <LoadingState title="Loading cart..." />
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="section-intro">
        <p className="eyebrow">Checkout prep</p>
        <h1>Your Cart</h1>
        <p className="muted">Local cart logic is already in place and can later map to user accounts or server-side sessions.</p>
      </section>

      {mode !== "api" ? (
        <IntegrationNote
          title="Local cart mode"
          copy="Cart uses localStorage now and is ready to map to customer sessions or accounts later."
          variant="warning"
        />
      ) : null}

      <section className="cart-layout">
        <div className="cart-stack">
          {summary.items.length ? summary.items.map((item) => (
            <article key={`${item.slug}-${item.variantId}`} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item__body">
                <h3>{item.shortName}</h3>
                <p>{item.brand} · {item.flavour} · {item.size}</p>
                <strong>{formatCurrency(item.price)}</strong>
              </div>
              <div className="cart-item__controls">
                <div className="qty-picker">
                  <button
                    type="button"
                    onClick={() => updateCartItemQty(item.slug, item.variantId, item.qty - 1)}
                  >
                    -
                  </button>
                  <strong>{item.qty}</strong>
                  <button
                    type="button"
                    onClick={() => updateCartItemQty(item.slug, item.variantId, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => removeFromCart(item.slug, item.variantId)}
                >
                  Remove
                </button>
              </div>
            </article>
          )) : (
            <EmptyState
              title="Your cart is empty"
              copy="Start with best sellers or explore a goal-based collection to build your stack."
              href="/products"
              label="Browse Products"
            />
          )}
        </div>

        <aside>
          {summary.items.length ? (
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(summary.subtotal)}</strong></div>
              <div className="summary-row"><span>Savings</span><strong>{formatCurrency(summary.discount)}</strong></div>
              <div className="summary-row"><span>Shipping</span><strong>{summary.shipping === 0 ? "Free" : formatCurrency(summary.shipping)}</strong></div>
              <div className="summary-row summary-row--total"><span>Total</span><strong>{formatCurrency(summary.total)}</strong></div>
              <Link className="button button--primary button--block" to="/checkout">Proceed to Checkout</Link>
              <Link className="button button--ghost button--block" to="/products">Continue Shopping</Link>
              <label className="field">
                <span>Coupon code</span>
                <div className="field-inline">
                  <input type="text" placeholder="Offer codes connect later" />
                  <button type="button" className="button button--dark">Apply</button>
                </div>
              </label>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
