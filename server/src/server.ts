import { config } from 'dotenv';
config();
import http from 'http';
import app from './app';
import { SocketService } from './shared/services/socket/SocketService';
import { VideoSignalingService } from './shared/services/video-signaling/VideoSignalingService';

const server = http.createServer(app);
const videoSignaling = new VideoSignalingService();
SocketService.getInstance().init(server, videoSignaling);
import logger from './shared/utils/Logger';

import connectToMongoDB from './shared/config/db/Mongodb';
connectToMongoDB();

import { JobQueueInitializer } from './shared/services/job-queue/JobQueueInitializer';
JobQueueInitializer.initialize();

import { updateCors } from './shared/config/backblaze/S3Client';
updateCors()
  .then(() => logger.info('Backblaze B2 CORS updated with frontend URL'))
  .catch((err) => logger.error('Failed to update Backblaze B2 CORS:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT as number, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});
