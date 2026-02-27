import { IStudentRepository } from '../../../modules/student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import { configureGoogleStrategy } from './GoogleStrategy';
import { configureFacebookStrategy } from './FacebookStrategy';

export const configurePassport = (
  studentRepo: IStudentRepository,
  instructorRepo: IInstructorRepository,
) => {
  configureGoogleStrategy(studentRepo, instructorRepo);
  configureFacebookStrategy(studentRepo, instructorRepo);
};
