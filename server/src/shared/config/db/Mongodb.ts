import mongoose from 'mongoose';
import logger from '../../utils/Logger';

function connectToMongoDB() {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillbyte')
    .then(() => logger.info('Connected to MongoDB ✅🚀'))
    .catch((err) => logger.error('MongoDB connection error:', err));
}

export default connectToMongoDB;
