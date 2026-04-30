import { Link } from "react-router-dom";
import { formatCurrency } from "../../js/ui.js";
import { useStore } from "../context/StoreContext.jsx";
import { EmptyState } from "../components/Feedback.jsx";

export default function OrderSuccessPage() {
  const { lastOrder } = useStore();

  return (
    <div className="shell">
      <section className="section">
        {lastOrder ? (
          <section className="success-card">
            <p className="eyebrow">Order confirmed</p>
            <h1>Thanks for shopping with Body Nation</h1>
            <p>Your order <strong>{lastOrder.orderId}</strong> has been captured in the frontend flow.</p>
            <div className="summary-row"><span>Total</span><strong>{formatCurrency(lastOrder.total)}</strong></div>
            <div className="summary-row"><span>Payment status</span><strong>{lastOrder.payment.status}</strong></div>
            <div className="summary-row"><span>Customer</span><strong>{lastOrder.customer.name}</strong></div>
            <div className="summary-row"><span>Delivery</span><strong>{lastOrder.customer.address}</strong></div>
            <Link className="button button--primary" to="/products">Continue Shopping</Link>
          </section>
        ) : (
          <EmptyState
            title="Order summary unavailable"
            copy="No recent order was found in local storage. Checkout again to populate this screen."
            href="/products"
            label="Shop now"
          />
        )}
      </section>
    </div>
  );
}
