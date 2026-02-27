const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ezpc_db';

async function seed() {
  // Override DNS to Google to fix ECONNREFUSED for MongoDB SRV records
  require('dns').setServers(['8.8.8.8']);
  
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

  try {
    console.log('Reading products.json...');
    const dataPath = path.join(__dirname, 'products.json');
    const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: { type: String, required: true },
      category: { type: String, required: true },
      brand: { type: String, required: true },
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
    }, { timestamps: true }));

    console.log('Cleaning old products...');
    await Product.deleteMany({});

    console.log(`Seeding ${products.length} products...`);
    await Product.insertMany(products);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
