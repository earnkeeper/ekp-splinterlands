import { logger, SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueWaiting,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';

@Processor(SCHEDULER_QUEUE)
export class QueueEventsService {
  @OnQueueActive()
  onQueueActive(job: Job) {
    logger.log(`Processing job ${job?.id} of type ${job?.name}`);
  }

  @OnQueueWaiting()
  onQueueWaiting(jobId: number | string) {
    logger.log(`Queued job ${jobId}`);
  }

  @OnQueueError()
  onQueueError(error: Error) {
    logger.error(error);
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job) {
    logger.log(`Completed job ${job.id}`);
  }
}
