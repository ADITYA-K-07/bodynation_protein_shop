import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { APP_CONFIG, buildApiUrl, isStaticPreview } from "../../js/config.js";
import { buildCartDetails } from "../../js/storage.js";
import { formatCurrency } from "../../js/ui.js";
import { useStore } from "../context/StoreContext.jsx";
import { EmptyState, IntegrationNote, LoadingState } from "../components/Feedback.jsx";
import { useCatalog } from "../lib/useCatalog.js";

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

function buildDemoOrderRecord(payload, paymentStatus = "demo") {
  return {
    orderId: `BN-${Date.now()}`,
    ...payload,
    payment: {
      status: paymentStatus,
    },
  };
}

export default function CheckoutPage() {
  const { products, loading } = useCatalog();
  const { saveOrder } = useStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    title: "Integration-ready checkout",
    copy: "This page is wired for POST /api/orders, POST /api/payment/create-order, and POST /api/payment/verify. It falls back to demo mode until those routes are live.",
    variant: "info",
  });
  const [processing, setProcessing] = useState(false);
  const summary = buildCartDetails(products);

  if (loading) {
    return (
      <div className="shell">
        <section className="section">
          <LoadingState title="Loading checkout..." />
        </section>
      </div>
    );
  }

  if (!summary.items.length) {
    return (
      <div className="shell">
        <section className="section">
          <EmptyState
            title="Nothing to checkout"
            copy="Add at least one product to the cart before opening the payment flow."
            href="/products"
            label="Go to shop"
          />
        </section>
      </div>
    );
  }

  function finalizeOrder(orderRecord) {
    saveOrder(orderRecord);
    navigate(`/order-success?orderId=${encodeURIComponent(orderRecord.orderId)}`);
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

  async function onSubmit(event) {
    event.preventDefault();
    setProcessing(true);
    const formData = new FormData(event.currentTarget);
    const payload = buildOrderPayload(summary, formData);

    try {
      const method = String(formData.get("paymentMethod"));

      if (method === "cod") {
        try {
          const orderRecord = await createCodOrder(payload);
          finalizeOrder({
            orderId: orderRecord.orderId || `BN-${Date.now()}`,
            ...payload,
            payment: { status: "pending" },
          });
          return;
        } catch {
          setStatus({
            title: "COD endpoint not live yet",
            copy: "Checkout continued in demo mode. Wire POST /api/orders to persist COD orders into MongoDB.",
            variant: "warning",
          });
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

        setStatus({
          title: "Razorpay key missing",
          copy: "Add window.BN_RAZORPAY_KEY_ID and load the backend payment routes to switch this button from demo to live payments.",
          variant: "warning",
        });
        finalizeOrder(buildDemoOrderRecord(payload, "prepaid-demo"));
      } catch {
        setStatus({
          title: "Payment API not connected",
          copy: "Frontend attempted POST /api/payment/create-order and fell back to demo completion. Enable Razorpay routes when backend is ready.",
          variant: "warning",
        });
        finalizeOrder(buildDemoOrderRecord(payload, "prepaid-demo"));
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="shell">
      <section className="section-intro">
        <p className="eyebrow">Payment</p>
        <h1>Checkout</h1>
        <p className="muted">Frontend is prepared for Razorpay order creation, verification, and COD persistence once backend routes are available.</p>
      </section>

      <section className="section">
        <div className="checkout-grid">
          <section className="panel">
            <IntegrationNote title={status.title} copy={status.copy} variant={status.variant} />

            <form className="checkout-form" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="full-name">Full Name</label>
                <input id="full-name" name="name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="phone-number">Phone Number</label>
                <input id="phone-number" name="phone" type="tel" required />
              </div>
              <div className="field">
                <label htmlFor="email-address">Email</label>
                <input id="email-address" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="address-line-1">Address Line 1</label>
                <input id="address-line-1" name="address1" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="address-line-2">Address Line 2</label>
                <input id="address-line-2" name="address2" type="text" />
              </div>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" type="text" required />
                </div>
                <div className="field">
                  <label htmlFor="state">State</label>
                  <input id="state" name="state" type="text" required />
                </div>
                <div className="field">
                  <label htmlFor="pin">PIN</label>
                  <input id="pin" name="pin" type="text" required />
                </div>
              </div>
              <fieldset className="payment-methods">
                <legend>Payment Method</legend>
                <label><input type="radio" name="paymentMethod" value="upi" defaultChecked /> UPI / Card / Net Banking</label>
                <label><input type="radio" name="paymentMethod" value="cod" /> Cash on Delivery</label>
              </fieldset>
              <button className="button button--primary button--block" type="submit" disabled={processing}>
                {processing ? "Processing..." : `Pay ${formatCurrency(summary.total)}`}
              </button>
            </form>
          </section>

          <aside>
            <div className="summary-card">
              <h3>Order Summary</h3>
              {summary.items.map((item) => (
                <div key={`${item.slug}-${item.variantId}`} className="summary-line-item">
                  <span>{item.shortName} x {item.qty}</span>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}
              <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(summary.subtotal)}</strong></div>
              <div className="summary-row"><span>Savings</span><strong>{formatCurrency(summary.discount)}</strong></div>
              <div className="summary-row"><span>Shipping</span><strong>{summary.shipping === 0 ? "Free" : formatCurrency(summary.shipping)}</strong></div>
              <div className="summary-row summary-row--total"><span>Total</span><strong>{formatCurrency(summary.total)}</strong></div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
