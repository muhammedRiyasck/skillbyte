import { ChatController } from '../controllers/ChatController';
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

// Repositories
const conversationReadRepository = new ConversationReadRepository();
const conversationWriteRepository = new ConversationWriteRepository();
const messageReadRepository = new MessageReadRepository();
const messageWriteRepository = new MessageWriteRepository();
const enrollmentReadRepository = new EnrollmentReadRepository();
const studentRepository = new StudentRepository();
const instructorRepository = new InstructorRepository();
const courseRepository = new CourseRepository();

const createConversationUseCase = new CreateConversationUseCase(
  conversationReadRepository,
  conversationWriteRepository,
  enrollmentReadRepository,
);

const sendMessageUseCase = new SendMessageUseCase(
  messageWriteRepository,
  conversationWriteRepository,
  conversationReadRepository,
);

const getConversationsUseCase = new GetConversationsUseCase(
  conversationReadRepository,
  studentRepository,
  instructorRepository,
  courseRepository,
);

const getMessagesUseCase = new GetMessagesUseCase(
  messageReadRepository,
  conversationReadRepository,
);

const markMessagesAsReadUseCase = new MarkMessagesAsReadUseCase(
  messageWriteRepository,
  conversationWriteRepository,
);

// Controller
export const chatController = new ChatController(
  createConversationUseCase,
  sendMessageUseCase,
  getConversationsUseCase,
  getMessagesUseCase,
  markMessagesAsReadUseCase,
);
