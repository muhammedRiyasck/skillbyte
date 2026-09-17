import { config } from 'dotenv';
config(); // Must be first — before ANY other import reads process.env

// TEMP DEBUG — remove after confirming env vars are loaded
console.log('[DEBUG] STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? `exists (starts with ${process.env.STRIPE_SECRET_KEY.slice(0, 10)}...)` : 'UNDEFINED');
console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('[DEBUG] PORT:', process.env.PORT);

import http from 'http';
import app from './app';
import { SocketService } from './shared/services/socket/SocketService';
import { VideoSignalingService } from './shared/services/video-signaling/VideoSignalingService';

const server = http.createServer(app);
const videoSignaling = new VideoSignalingService();
// Initialize Socket.io
SocketService.getInstance().init(server, videoSignaling);
import logger from './shared/utils/Logger';

import connectToMongoDB from './shared/config/db/Mongodb';
connectToMongoDB();

// Initialize job queue processors
import { JobQueueInitializer } from './shared/services/job-queue/JobQueueInitializer';
JobQueueInitializer.initialize();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
