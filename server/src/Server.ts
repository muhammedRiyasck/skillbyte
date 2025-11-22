import app from "./App";

import connectToMongoDB from "./shared/config/db/Mongodb";
connectToMongoDB();

// Initialize job queue processors
import { JobQueueInitializer } from "./shared/services/job-queue/JobQueueInitializer";
JobQueueInitializer.initialize();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
