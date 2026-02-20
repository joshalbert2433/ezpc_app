import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ezpc_db';

async function migrate() {
  console.log('--- Starting Migration ---');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Define the model locally in the script to avoid importing .ts files
    const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    const products = await Product.find({});
    console.log(`Found ${products.length} documents in 'products' collection.`);

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const raw = product.toObject();
      const updateOp = { $set: {}, $unset: {} };

      // 1. Convert image (string) to images (array)
      if (raw.image && typeof raw.image === 'string' && (!raw.images || raw.images.length === 0)) {
        updateOp.$set.images = [raw.image];
        updateOp.$unset.image = "";
        needsUpdate = true;
      }

      // 2. Initialize deletedAt
      if (raw.deletedAt === undefined) {
        updateOp.$set.deletedAt = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        if (Object.keys(updateOp.$unset).length === 0) delete updateOp.$unset;
        if (Object.keys(updateOp.$set).length === 0) delete updateOp.$set;

        await Product.findByIdAndUpdate(product._id, updateOp);
        updatedCount++;
      }
    }

    console.log(`Success! Updated ${updatedCount} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
