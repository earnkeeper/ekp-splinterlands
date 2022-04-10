import { logger, SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import {
  OnQueueActive,
  OnQueueError,
  OnQueueWaiting,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';

@Processor(SCHEDULER_QUEUE)
export class QueueEventsService {
  @OnQueueActive()
  onQueueActive(job: Job) {
    logger.log(
      `Processing job ${job?.id} of type ${job?.name} with data ${job?.data}`,
    );
  }

  @OnQueueWaiting()
  onQueueWaiting(jobId: number | string) {
    logger.log(`Queued job ${jobId}`);
  }

  @OnQueueError()
  onQueueError(error: Error) {
    logger.error(error);
  }
}
