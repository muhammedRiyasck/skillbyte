import { ChatController } from '../controllers/ChatController';
import { ChatUploadController } from '../controllers/ChatUploadController';
import { UploadChatFileUseCase } from '../../application/use-cases/UploadChatFileUseCase';
import { CreateConversationUseCase } from '../../application/use-cases/CreateConversationUseCase';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';
import { GetConversationsUseCase } from '../../application/use-cases/GetConversationsUseCase';
import { GetMessagesUseCase } from '../../application/use-cases/GetMessagesUseCase';
import { MarkMessagesAsReadUseCase } from '../../application/use-cases/MarkMessagesAsReadUseCase';
import { ConversationReadRepository } from '../../infrastructure/repositories/ConversationReadRepository';
import { ConversationWriteRepository } from '../../infrastructure/repositories/ConversationWriteRepository';
import { MessageReadRepository } from '../../infrastructure/repositories/MessageReadRepository';
import { MessageWriteRepository } from '../../infrastructure/repositories/MessageWriteRepository';
import { EnrollmentReadRepository } from '../../../enrollment/infrastructure/repositories/EnrollmentReadRepository';
import { StudentRepository } from '../../../student/infrastructure/repositories/StudentRepository';
import { InstructorRepository } from '../../../instructor/infrastructure/repositories/InstructorRepository';
import { CourseRepository } from '../../../course/infrastructure/repositories/CourseRepository';
import { NotificationRepository } from '../../../notification/infrastructure/repositories/NotificationRepository';
import { CreateNotificationUseCase } from '../../../notification/application/use-cases/CreateNotificationUseCase';
import { SocketChatNotifier } from '../../infrastructure/services/SocketChatNotifier';
import { ConversationPopulationService } from '../../application/services/ConversationPopulationService';
import { CloudinaryStorageService } from '../../../../shared/services/file-upload/services/CloudinaryStorageService';

// Repositories
const conversationReadRepository = new ConversationReadRepository();
const conversationWriteRepository = new ConversationWriteRepository();
const messageReadRepository = new MessageReadRepository();
const messageWriteRepository = new MessageWriteRepository();
const enrollmentReadRepository = new EnrollmentReadRepository();
const studentRepository = new StudentRepository();
const instructorRepository = new InstructorRepository();
const courseRepository = new CourseRepository();

const conversationPopulationService = new ConversationPopulationService(
  studentRepository,
  instructorRepository,
  courseRepository,
);

// Notifier
const chatNotifier = new SocketChatNotifier();

const createConversationUseCase = new CreateConversationUseCase(
  conversationReadRepository,
  conversationWriteRepository,
  enrollmentReadRepository,
  chatNotifier,
  conversationPopulationService,
);

const notificationRepository = new NotificationRepository();
const createNotificationUseCase = new CreateNotificationUseCase(
  notificationRepository,
);

const sendMessageUseCase = new SendMessageUseCase(
  messageWriteRepository,
  conversationWriteRepository,
  conversationReadRepository,
  chatNotifier,
  createNotificationUseCase,
);

const getConversationsUseCase = new GetConversationsUseCase(
  conversationReadRepository,
  conversationPopulationService,
);

const getMessagesUseCase = new GetMessagesUseCase(
  messageReadRepository,
  conversationReadRepository,
);

const markMessagesAsReadUseCase = new MarkMessagesAsReadUseCase(
  messageWriteRepository,
  conversationWriteRepository,
  chatNotifier,
);

// Controllers
export const chatController = new ChatController(
  createConversationUseCase,
  sendMessageUseCase,
  getConversationsUseCase,
  getMessagesUseCase,
  markMessagesAsReadUseCase,
);

const cloudinaryStorageService = new CloudinaryStorageService();
export const chatUploadController = new ChatUploadController(
  new UploadChatFileUseCase(cloudinaryStorageService),
);
