export const APP_CONFIG = {
  apiBaseUrl: globalThis.BN_API_BASE_URL || "/api",
  endpoints: {
    products: "/products",
    orders: "/orders",
    paymentCreateOrder: "/payment/create-order",
    paymentVerify: "/payment/verify",
  },
  razorpayKey: globalThis.BN_RAZORPAY_KEY_ID || "",
  demoCheckoutEnabled: true,
  freeShippingThreshold: 999,
  flatShippingFee: 99,
};

export function buildApiUrl(path) {
  return `${APP_CONFIG.apiBaseUrl}${path}`;
}

export function isStaticPreview() {
  return window.location.protocol === "file:";
}
