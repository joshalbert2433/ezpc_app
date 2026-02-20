import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ezpc_db';

async function forceMigration() {
  console.log('--- Force Syncing Schema to Documents ---');
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Low level collection access to avoid Mongoose schema interference
    const db = mongoose.connection.db;
    const collection = db.collection('products');

    const result = await collection.updateMany(
      {}, // All documents
      [
        {
          $set: {
            // Ensure images is an array, defaults to empty if missing
            images: { $ifNull: ["$images", []] },
            deletedAt: { $ifNull: ["$deletedAt", null] }
          }
        },
        {
            // If the old singular image field exists, move it to images array
            $set: {
                images: {
                    $cond: {
                        if: { $and: [ { $gt: [ { $type: "$image" }, "missing" ] }, { $eq: [ { $size: "$images" }, 0 ] } ] },
                        then: ["$image"],
                        else: "$images"
                    }
                }
            }
        }
      ]
    );

    console.log(`Matched ${result.matchedCount} and modified ${result.modifiedCount} documents.`);
    
    // Let's also check one document specifically
    const doc = await collection.findOne({});
    console.log('Sample document after sync:', JSON.stringify(doc, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Force migration failed:', error);
    process.exit(1);
  }
}

forceMigration();
