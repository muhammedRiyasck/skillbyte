import { PipelineStage } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { MentorshipSlotModel } from '../models/MentorshipSlotModel';
import { IMentorshipSlotDoc } from '../types/IMentorshipSlotDoc';
import {
  findAvailableSlotsType,
  findByInstructorIdQueryType,
} from '../types/IQueryTypes';
import { MentorshipMapper } from '../mappers/MentorshipMapper';

export class MentorshipSlotRepository
  extends BaseRepository<MentorshipSlot, IMentorshipSlotDoc>
  implements IMentorshipSlotRepository
{
  constructor() {
    super(MentorshipSlotModel);
  }

  toEntity(doc: IMentorshipSlotDoc): MentorshipSlot {
    return MentorshipMapper.toSlotEntity(doc);
  }

  async save(entity: MentorshipSlot): Promise<MentorshipSlot> {
    const data = {
      instructorId: entity.instructorId,
      title: entity.title,
      description: entity.description,
      duration: entity.duration,
      price: entity.price,
      currency: entity.currency,
      scheduledAt: entity.scheduledAt,
      status: entity.status,
      maxBookings: entity.maxBookings,
      currentBookings: entity.currentBookings,
      jobTitle: entity.jobTitle,
      tags: entity.tags,
      timezone: entity.timezone,
      updatedAt: new Date(),
    };

    let doc;
    if (entity.slotId) {
      doc = await this.model.findOneAndUpdate(
        { _id: entity.slotId },
        { $set: data },
        { new: true, runValidators: true },
      );
    } else {
      doc = await this.model.create({
        ...data,
      });
    }

    return this.toEntity(doc as IMentorshipSlotDoc);
  }

  async findByInstructorId(
    instructorId: string,
    filters?: {
      status?: SlotStatus;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<MentorshipSlot[]> {
    const query: findByInstructorIdQueryType = { instructorId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.fromDate || filters?.toDate) {
      query.scheduledAt = {};
      if (filters.fromDate) query.scheduledAt.$gte = filters.fromDate;
      if (filters.toDate) query.scheduledAt.$lte = filters.toDate;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const docs = await this.model
      .find(query)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    return docs.map((doc) => this.toEntity(doc));
  }

  async findAvailableSlots(filters?: {
    search?: string;
    jobTitle?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: Date;
    toDate?: Date;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<MentorshipSlot[]> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const pipeline: PipelineStage[] = [];

    // 1. Base Match (Status and Date)
    const matchStage: findAvailableSlotsType = {
      status: { $in: [SlotStatus.AVAILABLE] },
      scheduledAt: { $gte: tomorrow },
    };

    // 2. Specific Filters
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      matchStage.price = {};
      if (filters.minPrice !== undefined)
        matchStage.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined)
        matchStage.price.$lte = filters.maxPrice;
    }

    if (filters?.fromDate || filters?.toDate) {
      matchStage.scheduledAt = { ...matchStage.scheduledAt };
      if (filters.fromDate) matchStage.scheduledAt.$gte = filters.fromDate;
      if (filters.toDate) matchStage.scheduledAt.$lte = filters.toDate;
    }

    if (filters?.tags && filters.tags.length > 0) {
      matchStage.tags = { $in: filters.tags };
    }

    // Push basic match first to use index
    pipeline.push({ $match: matchStage });

    // 3. Lookup Instructor Details
    pipeline.push({
      $lookup: {
        from: 'instructors',
        localField: 'instructorId',
        foreignField: '_id',
        as: 'instructor',
      },
    });

    pipeline.push({
      $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true },
    });

    // 4. Search Filter
    if (filters?.search) {
      const searchTerm = filters.search;
      pipeline.push({
        $match: {
          $or: [
            { jobTitle: { $regex: searchTerm, $options: 'i' } },
            { 'instructor.name': { $regex: searchTerm, $options: 'i' } },
          ],
        },
      });
    } else if (filters?.jobTitle) {
      // Fallback for legacy jobTitle filter if search is not present
      pipeline.push({
        $match: {
          jobTitle: { $regex: filters.jobTitle, $options: 'i' },
        },
      });
    }

    // 5. Sort
    pipeline.push({ $sort: { scheduledAt: 1, _id: 1 } });

    // 6. Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute
    const docs = await this.model.aggregate(pipeline);

    return docs.map((doc) => {
      const mappedDoc = {
        ...doc,
        instructorId: doc.instructor,
      };
      return this.toEntity(mappedDoc);
    });
  }

  async findByJobTitle(jobTitle: string): Promise<MentorshipSlot[]> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const docs = await this.model
      .find({
        jobTitle: { $regex: jobTitle, $options: 'i' },
        status: SlotStatus.AVAILABLE,
        scheduledAt: { $gte: tomorrow },
      })
      .populate('instructorId', 'name profilePictureUrl jobTitle')
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async updateStatus(slotId: string, status: SlotStatus): Promise<void> {
    await this.model.findByIdAndUpdate(slotId, { status });
  }

  async incrementBookings(slotId: string): Promise<void> {
    const slot = await this.model.findByIdAndUpdate(
      slotId,
      { $inc: { currentBookings: 1 } },
      { new: true },
    );

    if (slot && slot.currentBookings >= slot.maxBookings) {
      await this.updateStatus(slotId, SlotStatus.BOOKED);
    }
  }

  async decrementBookings(slotId: string): Promise<void> {
    const slot = await this.model.findByIdAndUpdate(
      slotId,
      { $inc: { currentBookings: -1 } },
      { new: true },
    );

    if (slot && slot.currentBookings < slot.maxBookings) {
      await this.updateStatus(slotId, SlotStatus.AVAILABLE);
    }
  }

  async getUniqueTags(): Promise<string[]> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const tags = await this.model.distinct('tags', {
      status: SlotStatus.AVAILABLE,
      scheduledAt: { $gte: tomorrow },
    });

    return tags.filter((tag: string) => tag && tag.trim() !== '');
  }

  async findUpcomingSlots(instructorId: string): Promise<MentorshipSlot[]> {
    const docs = await this.model
      .find({
        instructorId,
        scheduledAt: { $gt: new Date() },
        status: { $in: [SlotStatus.AVAILABLE, SlotStatus.BOOKED] },
      })
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async hasOverlappingSlot(
    instructorId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const docs = await this.model.find({
      instructorId,
      status: { $in: [SlotStatus.AVAILABLE, SlotStatus.BOOKED] },
      $expr: {
        $and: [
          { $lt: ['$scheduledAt', endTime] },
          {
            $gt: [
              { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
              startTime,
            ],
          },
        ],
      },
    });
    return docs.length > 0;
  }
}
