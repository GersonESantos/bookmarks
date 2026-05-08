import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected locally');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookmark-app');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Atualiza todos os bookmarks existentes que não possuem o campo "status"
        await mongoose.connection.collection('bookmarks').updateMany(
            { status: { $exists: false } },
            { $set: { status: 'inicio' } }
        );
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
