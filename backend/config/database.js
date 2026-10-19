const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Support multiple environment variable names for flexibility across different hosting platforms (Railway, Heroku, etc.)
        const mongoUri = process.env.MONGO_URI || 
                         process.env.MONGODB_URI || 
                         process.env.DATABASE_URL || 
                         process.env.MONGODB_URL;

        if (!mongoUri) {
            throw new Error('MongoDB URI is not defined. Please check your Environment Variables (MONGO_URI, MONGODB_URI, etc.)');
        }

        // Auto-fix if '?' was missed before retryWrites (e.g. /cinestreamretryWrites=)
        if (mongoUri.includes('/cinestreamretryWrites=')) {
            mongoUri = mongoUri.replace('/cinestreamretryWrites=', '/cinestream?retryWrites=');
        }

        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
