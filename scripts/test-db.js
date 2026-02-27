const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function testConnection() {
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

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment or .env.local');
    process.exit(1);
  }

  // Remove credentials for logging
  const maskedUri = MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
  console.log('Testing connection to:', maskedUri);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name).join(', '));
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count = await Product.countDocuments();
    console.log(`Found ${count} products in the database.`);
    
    if (count > 0) {
      const sample = await Product.findOne();
      console.log('First product sample (truncated):', JSON.stringify(sample, null, 2).slice(0, 500));
    }

    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
