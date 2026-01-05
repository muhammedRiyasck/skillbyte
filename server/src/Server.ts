import http from 'http';
import { SocketService } from './shared/services/socket-service.ts/SocketService';

import app from './App';
const server = http.createServer(app);

// Initialize Socket.io
SocketService.getInstance().init(server);
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
