import { InstructorProfileController } from '../controllers/InstructorProfileController';
import { GetInstructorProfileUseCase } from '../../application/use-cases/GetInstructorProfileUseCase';
import { UpdateInstructorProfileUseCase } from '../../application/use-cases/UpdateInstructorProfileUseCase';
import { InstructorRepository } from '../../infrastructure/repositories/InstructorRepository';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';
import { StripeProvider } from '../../../../shared/services/payment/StripeProvider';
import { CreateStripeOnboardingLinkUseCase } from '../../application/use-cases/CreateStripeOnboardingLinkUseCase';
import { SyncStripeAccountStatusUseCase } from '../../application/use-cases/SyncStripeAccountStatusUseCase';
import { InstructorEarningsService } from '../../application/services/InstructorEarningsService';

const instructorRepository = new InstructorRepository();
const storageService = new CloudinaryStorageService();
const stripeProvider = new StripeProvider();

// Initialize earnings service to start listening for events
new InstructorEarningsService(instructorRepository);

const getInstructorProfileUseCase = new GetInstructorProfileUseCase(
  instructorRepository,
);
const updateInstructorProfileUseCase = new UpdateInstructorProfileUseCase(
  instructorRepository,
);
const createStripeOnboardingLinkUseCase = new CreateStripeOnboardingLinkUseCase(
  instructorRepository,
  stripeProvider,
);
const syncStripeAccountStatusUseCase = new SyncStripeAccountStatusUseCase(
  instructorRepository,
  stripeProvider,
);

export const instructorProfileController = new InstructorProfileController(
  getInstructorProfileUseCase,
  updateInstructorProfileUseCase,
  createStripeOnboardingLinkUseCase,
  syncStripeAccountStatusUseCase,
  storageService,
);
