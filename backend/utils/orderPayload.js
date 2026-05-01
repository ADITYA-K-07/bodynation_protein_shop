export function createOrderId() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BN-${timestamp}${random}`;
}

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

export function normalizeOrderInput(payload = {}) {
  const customer = payload.customer || {};
  const items = Array.isArray(payload.items)
    ? payload.items
        .map((item) => ({
          productSlug: String(item?.productSlug || '').trim(),
          name: String(item?.name || '').trim(),
          variant: String(item?.variant || '').trim(),
          qty: toNumber(item?.qty, 0),
          price: toNumber(item?.price, 0),
        }))
        .filter((item) => item.productSlug && item.name && item.variant && item.qty > 0)
    : [];

  return {
    customer: {
      name: String(customer.name || '').trim(),
      phone: String(customer.phone || '').trim(),
      email: String(customer.email || '').trim().toLowerCase(),
      address: String(customer.address || '').trim(),
    },
    items,
    subtotal: toNumber(payload.subtotal, 0),
    discount: toNumber(payload.discount, 0),
    shipping: toNumber(payload.shipping, 0),
    total: toNumber(payload.total, 0),
    paymentMethod: String(payload.paymentMethod || '').trim(),
  };
}

export function isValidOrderPayload(payload) {
  const customer = payload.customer || {};

  return Boolean(
    customer.name &&
      customer.phone &&
      customer.email &&
      customer.address &&
      payload.paymentMethod &&
      Array.isArray(payload.items) &&
      payload.items.length > 0 &&
      Number.isFinite(payload.total) &&
      payload.total >= 0,
  );
}
