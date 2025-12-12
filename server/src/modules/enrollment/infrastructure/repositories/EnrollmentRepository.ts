import { Types } from 'mongoose';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { IInstructorEnrollment } from '../../types/IInstructorEnrollment';
import { EnrollmentModel, IEnrollment } from '../models/EnrollmentModel';
import { PaymentModel, IPayment } from '../models/PaymentModel';

export class EnrollmentRepository implements IEnrollmentRepository {
  async createEnrollment(
    enrollmentData: Partial<IEnrollment>,
  ): Promise<IEnrollment> {
    return await EnrollmentModel.create(enrollmentData);
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<IEnrollment | null> {
    return await EnrollmentModel.findOne({ userId, courseId });
  }

  async findEnrollmentsForUser(
    userId: string,
    courseIds: string[],
  ): Promise<IEnrollment[]> {
    return await EnrollmentModel.find({ userId, courseId: { $in: courseIds } });
  }

  async findEnrollmentsByInstructor(
    instructorId: Types.ObjectId,
  ): Promise<IInstructorEnrollment[]> {
    // Find enrollments where the course belongs to the instructor
    return await EnrollmentModel.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: '$course',
      },
      {
        $match: {
          'course.instructorId': instructorId,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'userId',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      }
      ,
      {
        $project: {
          _id: 1,
          userId: {
            _id: '$student._id',
            name: '$student.name',
            email: '$student.email',
          },
          courseId: {
            _id: '$course._id',
            title: '$course.title',
            thumbnailUrl: '$course.thumbnailUrl',
            price: '$course.price',
          },
          status: 1,
          enrolledAt: 1,
          progress: 1,
        },
      },
    ]);
  }

  async updateEnrollmentStatus(
    enrollmentId: string,
    status: string,
  ): Promise<IEnrollment | null> {
    return await EnrollmentModel.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true },
    );
  }

  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    return await PaymentModel.create(paymentData);
  }

  async findPaymentByIntentId(
    paymentIntentId: string,
  ): Promise<IPayment | null> {
    return await PaymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
  }

  async updatePaymentStatus(
    paymentIntentId: string,
    status: string,
  ): Promise<IPayment | null> {
    return await PaymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status },
      { new: true },
    );
  }
}
