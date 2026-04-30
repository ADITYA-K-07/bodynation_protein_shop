export function integrationNoteVariantClass(variant = "info") {
  return `integration-note integration-note--${variant}`;
}

export function normalizeCategoryLabel(slug) {
  return slug.replace(/-/g, " ");
}

export function firstVariant(product) {
  return product.variants[0];
}
