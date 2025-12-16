import Queue from 'bull';

interface JobData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class JobQueueService {
  private _queues: Map<string, Queue.Queue<JobData>> = new Map();

  /**
   * Creates or gets an existing queue
   */
  getQueue(queueName: string): Queue.Queue<JobData> {
    if (!this._queues.has(queueName)) {
      const queue = new Queue(queueName, {
        redis: process.env.REDIS_URL!,
        defaultJobOptions: {
          removeOnComplete: 50, // Keep last 50 completed jobs
          removeOnFail: 10, // Keep last 10 failed jobs
          attempts: 3, // Retry failed jobs up to 3 times
          backoff: {
            type: 'exponential',
            delay: 2000, // Initial delay 2 seconds
          },
        },
      });

      this._queues.set(queueName, queue);
    }

    return this._queues.get(queueName)!;
  }

  /**
   * Adds a job to the specified queue
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: JobData,
    options?: Queue.JobOptions,
  ): Promise<Queue.Job<JobData>> {
    const queue = this.getQueue(queueName);
    return await queue.add(jobName, data, options);
  }

  /**
   * Processes jobs in the specified queue
   */
  processJob(
    queueName: string,
    jobName: string,
    processor: (job: Queue.Job<JobData>) => Promise<void>,
  ): void {
    const queue = this.getQueue(queueName);
    queue.process(jobName, processor);
  }

  /**
   * Closes all queues
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this._queues.values()).map((queue) =>
      queue.close(),
    );
    await Promise.all(closePromises);
    this._queues.clear();
  }

  /**
   * Gets queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  }
}

// Singleton instance
export const jobQueueService = new JobQueueService();
