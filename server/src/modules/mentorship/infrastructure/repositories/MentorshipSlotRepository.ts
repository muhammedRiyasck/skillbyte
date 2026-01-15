import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { MentorshipSlotModel } from '../models/MentorshipSlotModel';
import { IMentorshipSlotDoc } from '../types/IMentorshipSlotDoc';

export class MentorshipSlotRepository
  extends BaseRepository<MentorshipSlot, IMentorshipSlotDoc>
  implements IMentorshipSlotRepository
{
  constructor() {
    super(MentorshipSlotModel);
  }

  toEntity(doc: IMentorshipSlotDoc): MentorshipSlot {
    return new MentorshipSlot(
      doc.instructorId.toString(),
      doc.title,
      doc.description,
      doc.duration,
      doc.price,
      doc.currency,
      doc.scheduledAt,
      doc.status,
      doc.maxBookings,
      doc.currentBookings,
      doc.jobTitle,
      doc.tags,
      doc.timezone,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
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

  async findByInstructorId(instructorId: string): Promise<MentorshipSlot[]> {
    const docs = await this.model
      .find({ instructorId })
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findAvailableSlots(filters?: {
    jobTitle?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: Date;
    toDate?: Date;
    tags?: string[];
  }): Promise<MentorshipSlot[]> {
    const query: Record<string, unknown> = {
      status: 'available',
      scheduledAt: { $gt: new Date() }, // Only future slots
    };

    if (filters?.jobTitle)
      query.jobTitle = { $regex: filters.jobTitle, $options: 'i' };

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const priceQuery: Record<string, number> = {};
      if (filters.minPrice !== undefined) priceQuery.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceQuery.$lte = filters.maxPrice;
      query.price = priceQuery;
    }

    if (filters?.fromDate)
      query.scheduledAt = {
        ...((query.scheduledAt as object) || {}),
        $gte: filters.fromDate,
      };
    if (filters?.toDate)
      query.scheduledAt = {
        ...((query.scheduledAt as object) || {}),
        $lte: filters.toDate,
      };

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const docs = await this.model
      .find(query)
      .populate('instructorId', 'name profileImageUrl jobTitle')
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByJobTitle(jobTitle: string): Promise<MentorshipSlot[]> {
    const docs = await this.model
      .find({
        jobTitle: { $regex: jobTitle, $options: 'i' },
        status: 'available',
        scheduledAt: { $gt: new Date() },
      })
      .populate('instructorId', 'name profileImageUrl jobTitle')
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
      await this.updateStatus(slotId, 'booked');
    }
  }

  async decrementBookings(slotId: string): Promise<void> {
    const slot = await this.model.findByIdAndUpdate(
      slotId,
      { $inc: { currentBookings: -1 } },
      { new: true },
    );

    if (slot && slot.currentBookings < slot.maxBookings) {
      await this.updateStatus(slotId, 'available');
    }
  }

  async findUpcomingSlots(instructorId: string): Promise<MentorshipSlot[]> {
    const docs = await this.model
      .find({
        instructorId,
        scheduledAt: { $gt: new Date() },
        status: { $in: ['available', 'booked'] },
      })
      .sort({ scheduledAt: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }
}
