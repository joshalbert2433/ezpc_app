import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ezpc_db';

async function initStock() {
  console.log('--- Initializing Product Stock ---');
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('products');

    const result = await collection.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 10 } }
    );

    console.log(`Updated ${result.modifiedCount} products with default stock.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

initStock();
