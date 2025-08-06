const mongoose = require('mongoose');

// Configuration - Update these based on your setup
const CONFIG = {
  // Option 1: Local MongoDB
  local: 'mongodb://localhost:27017/lifepilot',
  
  // Option 2: Local MongoDB with authentication (if you set up users)
  localAuth: 'mongodb://admin:password@localhost:27017/lifepilot?authSource=admin',
  
  // Option 3: MongoDB Atlas (replace with your connection string)
  atlas: 'mongodb+srv://kelvinchau34:xdww123A!@lifepilot.ugwpwa2.mongodb.net/?retryWrites=true&w=majority&appName=LifePilot',
  
  // Option 4: Docker MongoDB
  docker: 'mongodb://admin:password@localhost:27017/lifepilot?authSource=admin'
};

// Choose your connection string here
const MONGODB_URI = process.env.MONGODB_URI || CONFIG.atlas;

// Test schema for basic operations
const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('ConnectionTest', testSchema);

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  console.log(`📍 Connection String: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}\n`);

  try {
    // Step 1: Connect to MongoDB
    console.log('1️⃣ Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🖥️  Host: ${mongoose.connection.host}:${mongoose.connection.port}\n`);

    // Step 2: Test write operation
    console.log('2️⃣ Testing write operation...');
    const testDoc = new TestModel({
      name: 'Connection Test User',
      email: 'test@lifepilot.com'
    });
    const savedDoc = await testDoc.save();
    console.log('✅ Write operation successful!');
    console.log(`📝 Created document with ID: ${savedDoc._id}\n`);

    // Step 3: Test read operation
    console.log('3️⃣ Testing read operation...');
    const foundDoc = await TestModel.findById(savedDoc._id);
    console.log('✅ Read operation successful!');
    console.log(`📖 Found document: ${foundDoc.name} (${foundDoc.email})\n`);

    // Step 4: Test update operation
    console.log('4️⃣ Testing update operation...');
    foundDoc.name = 'Updated Test User';
    await foundDoc.save();
    console.log('✅ Update operation successful!\n');

    // Step 5: Test query operation
    console.log('5️⃣ Testing query operation...');
    const allTestDocs = await TestModel.find({ email: 'test@lifepilot.com' });
    console.log(`✅ Query operation successful! Found ${allTestDocs.length} document(s)\n`);

    // Step 6: Clean up test data
    console.log('6️⃣ Cleaning up test data...');
    await TestModel.deleteMany({ email: 'test@lifepilot.com' });
    console.log('✅ Cleanup completed!\n');

    // Step 7: Test database info
    console.log('7️⃣ Getting database information...');
    const admin = mongoose.connection.db.admin();
    const dbStats = await mongoose.connection.db.stats();
    console.log('✅ Database stats retrieved!');
    console.log(`📊 Collections: ${dbStats.collections}`);
    console.log(`💾 Database Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB\n`);

    // Success summary
    console.log('🎉 ALL TESTS PASSED! MongoDB is ready for LifePilot backend.\n');
    console.log('✨ Next steps:');
    console.log('   1. Set up your backend structure');
    console.log('   2. Configure environment variables');
    console.log('   3. Start building the authentication system\n');

  } catch (error) {
    console.error('❌ MongoDB Connection Test Failed!\n');
    console.error('🔍 Error Details:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}\n`);

    // Provide helpful troubleshooting tips
    console.log('🛠️  Troubleshooting Tips:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   • MongoDB server is not running');
      console.log('   • Check if MongoDB service is started:');
      console.log('     - macOS: brew services start mongodb-community');
      console.log('     - Linux: sudo systemctl start mongod');
      console.log('     - Windows: net start MongoDB');
      console.log('     - Docker: docker run -d -p 27017:27017 mongo:6.0');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('   • Check username and password in connection string');
      console.log('   • Verify database user permissions');
      console.log('   • For Atlas: check whitelist IP addresses');
    }
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('   • Check network connection');
      console.log('   • Verify MongoDB Atlas cluster URL');
      console.log('   • Check if behind firewall/proxy');
    }

    console.log('\n📚 Connection String Examples:');
    console.log('   Local: mongodb://localhost:27017/lifepilot');
    console.log('   Atlas: mongodb+srv://user:pass@cluster.mongodb.net/lifepilot');
    console.log('   Docker: mongodb://admin:password@localhost:27017/lifepilot?authSource=admin\n');

  } finally {
    // Always close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed.');
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testMongoDBConnection();
}

module.exports = testMongoDBConnection;