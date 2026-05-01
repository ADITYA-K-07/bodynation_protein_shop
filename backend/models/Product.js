import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    flavour: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false, id: false },
);

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    heroImage: {
      type: String,
      required: true,
      trim: true,
    },
    ratingAverage: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    ratingCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    nutritionFacts: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
      validate(value) {
        return Array.isArray(value) && value.length > 0;
      },
    },
    labReportUrl: {
      type: String,
      default: '#',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
  },
);

export default mongoose.model('Product', productSchema);
