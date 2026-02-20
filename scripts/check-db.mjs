import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ezpc_db';

async function checkDB() {
  console.log('--- Database Schema Check ---');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Use a very permissive schema to see what is ACTUALLY in the DB
    const Product = mongoose.models.ProductCheck || mongoose.model('ProductCheck', new mongoose.Schema({}, { strict: false, collection: 'products' }));

    const products = await Product.find({}).limit(5);
    
    console.log(`Checking ${products.length} products:`);
    products.forEach((p, i) => {
      const obj = p.toObject();
      console.log(`
[Product ${i+1}] ${obj.name}`);
      console.log(`- ID: ${obj._id}`);
      console.log(`- Has 'image' field? ${'image' in obj ? 'YES' : 'NO'}`);
      console.log(`- Has 'images' field? ${'images' in obj ? 'YES' : 'NO'}`);
      if ('images' in obj) {
        console.log(`- 'images' value:`, obj.images);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkDB();
