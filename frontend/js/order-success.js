import { getLastOrder } from "./storage.js";
import { emptyStateMarkup, formatCurrency } from "./ui.js";

const mount = document.querySelector("[data-order-success]");
const order = getLastOrder();

if (mount) {
  if (!order) {
    mount.innerHTML = emptyStateMarkup(
      "Order summary unavailable",
      "No recent order was found in local storage. Checkout again to populate this screen.",
      "products.html",
      "Shop now"
    );
  } else {
    mount.innerHTML = `
      <section class="success-card">
        <p class="eyebrow">Order confirmed</p>
        <h1>Thanks for shopping with Body Nation</h1>
        <p>Your order <strong>${order.orderId}</strong> has been captured in the frontend flow.</p>
        <div class="summary-row"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
        <div class="summary-row"><span>Payment status</span><strong>${order.payment.status}</strong></div>
        <div class="summary-row"><span>Customer</span><strong>${order.customer.name}</strong></div>
        <div class="summary-row"><span>Delivery</span><strong>${order.customer.address}</strong></div>
        <a class="button button--primary" href="products.html">Continue Shopping</a>
      </section>
    `;
  }
}
