import { useEffect, useState } from 'react';
import type { Product, ProductVariant } from '../types';
import type { ProductInput } from '../api/products';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (payload: ProductInput, productId?: string) => Promise<void>;
}

interface FormState {
  id: string;
  slug: string;
  brand: string;
  name: string;
  shortName: string;
  category: string;
  goal: string;
  color: string;
  image: string;
  heroImage: string;
  ratingAverage: number;
  ratingCount: number;
  badges: string;
  description: string;
  highlights: string;
  nutritionFacts: string;
  labReportUrl: string;
  isActive: boolean;
  variants: ProductVariant[];
}

const emptyVariant = (): ProductVariant => ({
  id: '',
  flavour: '',
  size: '',
  price: 0,
  mrp: 0,
  stock: 0,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildInitialState(product: Product | null): FormState {
  if (!product) {
    return {
      id: '',
      slug: '',
      brand: '',
      name: '',
      shortName: '',
      category: '',
      goal: '',
      color: 'orange',
      image: '',
      heroImage: '',
      ratingAverage: 4.5,
      ratingCount: 0,
      badges: 'LAB TESTED',
      description: '',
      highlights: '',
      nutritionFacts: '',
      labReportUrl: '#',
      isActive: true,
      variants: [emptyVariant()],
    };
  }

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    shortName: product.shortName,
    category: product.category,
    goal: product.goal,
    color: product.color,
    image: product.image,
    heroImage: product.heroImage,
    ratingAverage: product.ratingAverage,
    ratingCount: product.ratingCount,
    badges: product.badges.join(', '),
    description: product.description,
    highlights: product.highlights.join('\n'),
    nutritionFacts: product.nutritionFacts.join('\n'),
    labReportUrl: product.labReportUrl,
    isActive: product.isActive,
    variants: product.variants.length ? product.variants : [emptyVariant()],
  };
}

export default function ProductFormModal({
  open,
  product,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(buildInitialState(product));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(buildInitialState(product));
  }, [product, open]);

  if (!open) {
    return null;
  }

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    setForm((currentForm) => ({
      ...currentForm,
      variants: currentForm.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    }));
  }

  function addVariant() {
    setForm((currentForm) => ({
      ...currentForm,
      variants: [...currentForm.variants, emptyVariant()],
    }));
  }

  function removeVariant(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      variants: currentForm.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function openCloudinaryWidget() {
    if (!window.cloudinary) {
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
      },
      (error, result) => {
        if (error || result.event !== 'success' || !result.info?.secure_url) {
          return;
        }

        setForm((currentForm) => ({
          ...currentForm,
          image: result.info?.secure_url || currentForm.image,
          heroImage: currentForm.heroImage || result.info?.secure_url || currentForm.heroImage,
        }));
      },
    );

    widget.open();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const generatedSlug = form.slug || slugify(form.name);
      const generatedId = form.id || `bn-${Date.now()}`;
      const payload: ProductInput = {
        id: generatedId,
        slug: generatedSlug,
        brand: form.brand,
        name: form.name,
        shortName: form.shortName,
        category: form.category,
        goal: form.goal,
        color: form.color,
        image: form.image,
        heroImage: form.heroImage || form.image,
        ratingAverage: Number(form.ratingAverage),
        ratingCount: Number(form.ratingCount),
        badges: form.badges
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        description: form.description,
        highlights: form.highlights
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        nutritionFacts: form.nutritionFacts
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        labReportUrl: form.labReportUrl,
        isActive: form.isActive,
        variants: form.variants.map((variant, index) => ({
          ...variant,
          id: variant.id || `${generatedSlug || 'product'}-variant-${index + 1}`,
        })),
      };

      await onSubmit(payload, product?._id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{product ? 'Edit product' : 'Add product'}</p>
            <h3>{product ? 'Update catalog entry' : 'Create new catalog entry'}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Product ID
              <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} />
            </label>
            <label>
              Slug
              <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
            </label>
            <label>
              Brand
              <input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} required />
            </label>
            <label>
              Product Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Short Name
              <input
                value={form.shortName}
                onChange={(event) => setForm({ ...form, shortName: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              />
            </label>
            <label>
              Goal
              <input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} required />
            </label>
            <label>
              Color
              <input value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} required />
            </label>
            <label>
              Rating Average
              <input
                type="number"
                step="0.1"
                value={form.ratingAverage}
                onChange={(event) => setForm({ ...form, ratingAverage: Number(event.target.value) })}
              />
            </label>
            <label>
              Rating Count
              <input
                type="number"
                value={form.ratingCount}
                onChange={(event) => setForm({ ...form, ratingCount: Number(event.target.value) })}
              />
            </label>
            <label className="form-grid__wide">
              Image URL
              <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
            </label>
            <label className="form-grid__wide">
              Hero Image URL
              <input value={form.heroImage} onChange={(event) => setForm({ ...form, heroImage: event.target.value })} />
            </label>
            <label className="form-grid__wide">
              Badges
              <input value={form.badges} onChange={(event) => setForm({ ...form, badges: event.target.value })} />
            </label>
            <label className="form-grid__wide">
              Description
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
              />
            </label>
            <label className="form-grid__wide">
              Highlights (one per line)
              <textarea
                rows={4}
                value={form.highlights}
                onChange={(event) => setForm({ ...form, highlights: event.target.value })}
              />
            </label>
            <label className="form-grid__wide">
              Nutrition Facts (one per line)
              <textarea
                rows={4}
                value={form.nutritionFacts}
                onChange={(event) => setForm({ ...form, nutritionFacts: event.target.value })}
              />
            </label>
            <label className="form-grid__wide">
              Lab Report URL
              <input
                value={form.labReportUrl}
                onChange={(event) => setForm({ ...form, labReportUrl: event.target.value })}
              />
            </label>
          </div>

          <div className="upload-row">
            <button type="button" className="button button--ghost" onClick={openCloudinaryWidget}>
              Upload with Cloudinary
            </button>
            <label className="switch-row">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              />
              <span>Visible in storefront</span>
            </label>
          </div>

          <section className="variants-panel">
            <div className="section-line">
              <div>
                <p className="eyebrow">Variants</p>
                <h4>Flavour, size, price, and stock</h4>
              </div>
              <button type="button" className="button button--ghost" onClick={addVariant}>
                Add Variant
              </button>
            </div>

            {form.variants.map((variant, index) => (
              <div className="variant-grid" key={`${variant.id || 'new'}-${index}`}>
                <label>
                  Variant ID
                  <input value={variant.id} onChange={(event) => updateVariant(index, { id: event.target.value })} />
                </label>
                <label>
                  Flavour
                  <input
                    value={variant.flavour}
                    onChange={(event) => updateVariant(index, { flavour: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Size
                  <input value={variant.size} onChange={(event) => updateVariant(index, { size: event.target.value })} required />
                </label>
                <label>
                  Price
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(event) => updateVariant(index, { price: Number(event.target.value) })}
                    required
                  />
                </label>
                <label>
                  MRP
                  <input
                    type="number"
                    value={variant.mrp}
                    onChange={(event) => updateVariant(index, { mrp: Number(event.target.value) })}
                    required
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })}
                    required
                  />
                </label>
                <button
                  type="button"
                  className="table-link table-link--danger"
                  onClick={() => removeVariant(index)}
                  disabled={form.variants.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <div className="modal-actions">
            <button type="button" className="button button--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={saving}>
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
