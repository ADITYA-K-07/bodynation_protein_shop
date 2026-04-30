import { buildApiUrl, isStaticPreview, APP_CONFIG } from "./config.js";
import { getCatalog } from "./catalog.js";
import { buildCartDetails, clearCart, setLastOrder } from "./storage.js";
import { emptyStateMarkup, formatCurrency, integrationNoteMarkup } from "./ui.js";

function summaryMarkup(summary) {
  return `
    <div class="summary-card">
      <h3>Order Summary</h3>
      ${summary.items
        .map(
          (item) => `
            <div class="summary-line-item">
              <span>${item.shortName} x ${item.qty}</span>
              <strong>${formatCurrency(item.lineTotal)}</strong>
            </div>
          `
        )
        .join("")}
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(summary.subtotal)}</strong></div>
      <div class="summary-row"><span>Savings</span><strong>${formatCurrency(summary.discount)}</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>${summary.shipping === 0 ? "Free" : formatCurrency(summary.shipping)}</strong></div>
      <div class="summary-row summary-row--total"><span>Total</span><strong>${formatCurrency(summary.total)}</strong></div>
    </div>
  `;
}

function renderCheckout(products) {
  const mount = document.querySelector("[data-checkout-stage]");
  if (!mount) {
    return null;
  }

  const summary = buildCartDetails(products);
  if (!summary.items.length) {
    mount.innerHTML = emptyStateMarkup(
      "Nothing to checkout",
      "Add at least one product to the cart before opening the payment flow.",
      "products.html",
      "Go to shop"
    );
    return null;
  }

  mount.innerHTML = `
    <div class="checkout-grid">
      <section class="panel">
        <div data-checkout-status>
          ${integrationNoteMarkup(
            "Integration-ready checkout",
            "This page is wired for POST /api/orders, POST /api/payment/create-order, and POST /api/payment/verify. It falls back to demo mode until those routes are live.",
            "info"
          )}
        </div>
        <form class="checkout-form" data-checkout-form>
          <div class="field">
            <label for="full-name">Full Name</label>
            <input id="full-name" name="name" type="text" required>
          </div>
          <div class="field">
            <label for="phone-number">Phone Number</label>
            <input id="phone-number" name="phone" type="tel" required>
          </div>
          <div class="field">
            <label for="email-address">Email</label>
            <input id="email-address" name="email" type="email" required>
          </div>
          <div class="field">
            <label for="address-line-1">Address Line 1</label>
            <input id="address-line-1" name="address1" type="text" required>
          </div>
          <div class="field">
            <label for="address-line-2">Address Line 2</label>
            <input id="address-line-2" name="address2" type="text">
          </div>
          <div class="field-grid">
            <div class="field">
              <label for="city">City</label>
              <input id="city" name="city" type="text" required>
            </div>
            <div class="field">
              <label for="state">State</label>
              <input id="state" name="state" type="text" required>
            </div>
            <div class="field">
              <label for="pin">PIN</label>
              <input id="pin" name="pin" type="text" required>
            </div>
          </div>
          <fieldset class="payment-methods">
            <legend>Payment Method</legend>
            <label><input type="radio" name="paymentMethod" value="upi" checked> UPI / Card / Net Banking</label>
            <label><input type="radio" name="paymentMethod" value="cod"> Cash on Delivery</label>
          </fieldset>
          <button class="button button--primary button--block" type="submit" data-checkout-submit>
            Pay ${formatCurrency(summary.total)}
          </button>
        </form>
      </section>
      <aside data-checkout-summary>
        ${summaryMarkup(summary)}
      </aside>
    </div>
  `;

  return summary;
}

async function createCodOrder(payload) {
  if (isStaticPreview()) {
    throw new Error("Static preview");
  }

  const response = await fetch(buildApiUrl(APP_CONFIG.endpoints.orders), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`COD order request failed: ${response.status}`);
  }

  return response.json();
}

async function createPaymentOrder(payload) {
  if (isStaticPreview()) {
    throw new Error("Static preview");
  }

  const response = await fetch(buildApiUrl(APP_CONFIG.endpoints.paymentCreateOrder), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Payment order request failed: ${response.status}`);
  }

  return response.json();
}

async function verifyPayment(payload) {
  const response = await fetch(buildApiUrl(APP_CONFIG.endpoints.paymentVerify), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Payment verification failed: ${response.status}`);
  }

  return response.json();
}

function buildOrderPayload(summary, formData) {
  return {
    customer: {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: `${formData.get("address1")}, ${formData.get("address2") || ""}, ${formData.get("city")}, ${formData.get("state")} - ${formData.get("pin")}`.replace(", ,", ","),
    },
    items: summary.items.map((item) => ({
      productSlug: item.slug,
      name: item.shortName,
      variant: `${item.flavour} / ${item.size}`,
      qty: item.qty,
      price: item.price,
    })),
    subtotal: summary.subtotal,
    discount: summary.discount,
    shipping: summary.shipping,
    total: summary.total,
    paymentMethod: formData.get("paymentMethod"),
  };
}

function finalizeOrder(orderRecord) {
  setLastOrder(orderRecord);
  clearCart();
  window.location.href = `order-success.html?orderId=${encodeURIComponent(orderRecord.orderId)}`;
}

function buildDemoOrderRecord(payload, paymentStatus = "demo") {
  return {
    orderId: `BN-${Date.now()}`,
    ...payload,
    payment: {
      status: paymentStatus,
    },
  };
}

function openRazorpayFlow(paymentOrder, payload) {
  const options = {
    key: APP_CONFIG.razorpayKey,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency || "INR",
    name: "Body Nation",
    description: "Supplement order",
    order_id: paymentOrder.id || paymentOrder.order_id,
    handler: async (response) => {
      const verified = await verifyPayment({
        ...response,
        order: payload,
      });

      finalizeOrder({
        orderId: verified.orderId || `BN-${Date.now()}`,
        ...payload,
        payment: {
          status: "paid",
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
        },
      });
    },
    prefill: {
      name: payload.customer.name,
      email: payload.customer.email,
      contact: payload.customer.phone,
    },
    theme: {
      color: "#FF6600",
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}

async function bindCheckout(summary) {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = document.querySelector("[data-checkout-submit]");
    const statusMount = document.querySelector("[data-checkout-status]");
    const formData = new FormData(form);
    const payload = buildOrderPayload(summary, formData);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Processing...";
    }

    try {
      const method = String(formData.get("paymentMethod"));

      if (method === "cod") {
        try {
          const orderRecord = await createCodOrder(payload);
          finalizeOrder({
            orderId: orderRecord.orderId || `BN-${Date.now()}`,
            ...payload,
            payment: {
              status: "pending",
            },
          });
          return;
        } catch (error) {
          if (statusMount) {
            statusMount.innerHTML = integrationNoteMarkup(
              "COD endpoint not live yet",
              "Checkout continued in demo mode. Wire POST /api/orders to persist COD orders into MongoDB.",
              "warning"
            );
          }
          finalizeOrder(buildDemoOrderRecord(payload, "cod-demo"));
          return;
        }
      }

      try {
        const paymentOrder = await createPaymentOrder({
          amount: summary.total,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          order: payload,
        });

        if (window.Razorpay && APP_CONFIG.razorpayKey) {
          openRazorpayFlow(paymentOrder, payload);
          return;
        }

        if (statusMount) {
          statusMount.innerHTML = integrationNoteMarkup(
            "Razorpay key missing",
            "Add window.BN_RAZORPAY_KEY_ID and load the backend payment routes to switch this button from demo to live payments.",
            "warning"
          );
        }
        finalizeOrder(buildDemoOrderRecord(payload, "prepaid-demo"));
      } catch (error) {
        if (statusMount) {
          statusMount.innerHTML = integrationNoteMarkup(
            "Payment API not connected",
            "Frontend attempted POST /api/payment/create-order and fell back to demo completion. Enable Razorpay routes when backend is ready.",
            "warning"
          );
        }
        finalizeOrder(buildDemoOrderRecord(payload, "prepaid-demo"));
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = `Pay ${formatCurrency(summary.total)}`;
      }
    }
  });
}

const catalog = await getCatalog();
const summary = renderCheckout(catalog.products);
if (summary) {
  await bindCheckout(summary);
}
