const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ezpc_db';

async function seed() {
  try {
    console.log('Reading products.json...');
    const dataPath = path.join(__dirname, 'products.json');
    const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: String,
      category: String,
      brand: String,
      price: Number,
      specs: String,
      badge: String,
      rating: Number,
      reviews: Number,
      description: String
    }));

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
