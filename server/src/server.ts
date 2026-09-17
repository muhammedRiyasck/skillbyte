import { config } from 'dotenv';
config(); // Must be first — before ANY other import reads process.env

// TEMP DEBUG — log all env keys Railway is injecting
console.log('[DEBUG] ALL ENV KEYS:', Object.keys(process.env).join(', '));
console.log('[DEBUG] STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? `exists (${process.env.STRIPE_SECRET_KEY.slice(0,12)}...)` : 'UNDEFINED');
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
