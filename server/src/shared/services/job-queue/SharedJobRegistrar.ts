import { EmailProcessor } from './processors/EmailProcessor';
import { NodeMailerService } from '../../services/mail/NodeMailerService';
import logger from '../../utils/Logger';

/**
 * Registers all background job processors that belong to shared/cross-cutting
 * concerns (e.g. email delivery).
 *
 * Follows the same pattern as domain-specific registrars (InstructorJobRegistrar,
 * MentorshipJobRegistrar, etc.) so that JobQueueInitializer stays closed for
 * modification and free of concrete implementation details (OCP / DIP).
 */
export function registerSharedJobs(): void {
  // Wire the email processor — constructor self-registers via jobQueueService
  new EmailProcessor(new NodeMailerService());

  logger.info('Shared job processors registered');
}
