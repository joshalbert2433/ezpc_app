const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Override DNS to Google to fix ECONNREFUSED for MongoDB SRV records
require('dns').setServers(['8.8.8.8']);

async function initializeModels() {
  let MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^MONGODB_URI=(.+)$/m);
      if (match) {
        MONGODB_URI = match[1].trim();
      }
    }
  }

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // --- Product Model ---
    const ProductSchema = new mongoose.Schema({
      name: { type: String, required: true, index: true },
      category: { type: String, required: true, index: true },
      brand: { type: String, required: true, index: true },
      price: { type: Number, required: true },
      salePrice: { type: Number, default: 0 },
      stock: { type: Number, default: 0 },
      specs: { type: String, required: true },
      badge: String,
      rating: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 },
      description: String,
      images: { type: [String], default: [] },
      fullSpecs: [{ label: String, value: String }],
      deletedAt: { type: Date, default: null },
    }, { timestamps: true });
    ProductSchema.index({ name: 'text', brand: 'text', category: 'text', specs: 'text' });
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    // --- User Model ---
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
      }],
      wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      addresses: [new mongoose.Schema({
        label: String, fullName: String, phone: String, building: String,
        houseUnit: String, street: String, city: String, state: String,
        zipCode: String, isDefault: Boolean
      })]
    }, { timestamps: true });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // --- Order Model ---
    const OrderSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String, price: Number, quantity: Number, image: String
      }],
      shippingAddress: {
        fullName: String, phone: String, building: String, houseUnit: String,
        street: String, city: String, state: String, zipCode: String
      },
      paymentMethod: { type: String, required: true },
      paymentResult: Object,
      totalAmount: { type: Number, required: true },
      status: { type: String, default: 'pending', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }
    }, { timestamps: true });
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

    // --- Review Model ---
    const ReviewSchema = new mongoose.Schema({
      productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product', index: true },
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      userName: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
    }, { timestamps: true });
    ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
    const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

    // --- Settings Model ---
    const SettingsSchema = new mongoose.Schema({
      key: { type: String, required: true, unique: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
    }, { timestamps: true });
    const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

    console.log('Ensuring collections and indexes are created...');
    
    // Perform a count on each to trigger initialization
    await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Settings.countDocuments()
    ]);

    console.log('Success! All models (Product, User, Order, Review, Settings) are initialized on Atlas.');
    
    // List collections to verify
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Active Collections:', collections.map(c => c.name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

initializeModels();
