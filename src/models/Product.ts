import mongoose from 'mongoose';

const ProductSpecSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true }, // GPU, CPU, RAM, Monitor, etc.
  brand: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  specs: { type: String, required: true }, // Summary string for the card
  badge: String,
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  description: String,
  image: String,
  fullSpecs: [ProductSpecSchema], // Flexible attributes for any category
}, { timestamps: true });

// Add a text index for search functionality
ProductSchema.index({ name: 'text', brand: 'text', category: 'text', specs: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
