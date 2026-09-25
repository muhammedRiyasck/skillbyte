import { useForm } from 'react-hook-form';
import TextInput from '@/shared/components/TextInput';
import ErrorMessage from '@/shared/components/ErrorMessage';
import type {
  CreateSlotRequest,
  CreateRecurringSlotRequest,
} from '../types/mentorshipTypes';
import { useEffect, useMemo, useState } from 'react';
import { Calendar, IndianRupee, Repeat, Sparkles } from 'lucide-react';
import { SlotStatus } from '@shared/enums/SlotStatus';
import { toast } from 'sonner';

interface SlotFormProps {
  initialData?: Partial<CreateSlotRequest>;
  onSubmit: (data: CreateSlotRequest) => void;
  onSubmitRecurring?: (data: CreateRecurringSlotRequest) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const SlotForm = ({
  initialData,
  onSubmit,
  onSubmitRecurring,
  isLoading,
}: SlotFormProps) => {
  const isEditMode = !!initialData;
  const [slotType, setSlotType] = useState<'single' | 'recurring'>('single');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [recurringTime, setRecurringTime] = useState('10:00');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSlotRequest>({
    mode: 'onChange',
    defaultValues: {
      duration: 60,
      price: 0,
      title: 'Mentorship Session',
      tags: [],
      ...initialData,
    },
  });

  const [tagInput, setTagInput] = useState('');
  const currentTags = watch('tags') || [];


  useEffect(() => {
    if (initialData?.scheduledAt) {
      const date = new Date(initialData.scheduledAt);
      const offset = date.getTimezoneOffset() * 60000;
      const localIso = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
      setValue('scheduledAt', localIso);
    }
    if (initialData?.tags) {
      setValue('tags', initialData.tags);
    }
  }, [initialData, setValue]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !currentTags.includes(newTag)) {
        setValue('tags', [...currentTags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const toggleDay = (dayVal: number) => {
    if (selectedDays.includes(dayVal)) {
      if (selectedDays.length === 1) {
        toast.error('At least one day must be selected');
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== dayVal));
    } else {
      setSelectedDays([...selectedDays, dayVal].sort((a, b) => a - b));
    }
  };

  const estimatedSlotCount = useMemo(() => {
    if (!startDate || !endDate || !recurringTime) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    const endLimit = new Date(end);
    endLimit.setHours(23, 59, 59, 999);

    const [hrs, mins] = recurringTime.split(':').map(Number);
    const now = new Date();

    while (cur <= endLimit) {
      const day = cur.getDay();
      if (frequency === 'daily' || selectedDays.includes(day)) {
        const slotDate = new Date(cur);
        slotDate.setHours(hrs || 0, mins || 0, 0, 0);
        if (slotDate > now) {
          count++;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, recurringTime, frequency, selectedDays]);

  const onFormSubmit = (data: CreateSlotRequest) => {
    if (slotType === 'recurring' && !isEditMode) {
      if (!startDate || !endDate) {
        toast.error('Please select start and end dates');
        return;
      }
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      if (eDate < sDate) {
        toast.error('End date cannot be earlier than start date');
        return;
      }
      if (frequency === 'weekly' && selectedDays.length === 0) {
        toast.error('Please select at least one day of the week');
        return;
      }
      if (!recurringTime) {
        toast.error('Please select a session time');
        return;
      }

      if (onSubmitRecurring) {
        const recurringPayload: CreateRecurringSlotRequest = {
          title: data.title || 'Mentorship Session',
          description: data.description || '',
          duration: Number(data.duration),
          price: Number(data.price),
          currency: 'INR',
          tags: currentTags,
          timezoneOffset: new Date().getTimezoneOffset(),
          recurrence: {
            frequency,
            ...(frequency === 'weekly' ? { daysOfWeek: selectedDays } : {}),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            time: recurringTime,
          },
        };
        onSubmitRecurring(recurringPayload);
      }
      return;
    }

    const payload: CreateSlotRequest = {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      duration: Number(data.duration),
      price: Number(data.price),
      tags: currentTags,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Tab Switcher: One-Time vs Recurring (New Slot Only) */}
      {!isEditMode && (
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setSlotType('single')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${slotType === 'single'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Calendar size={16} />
            One-Time Slot
          </button>
          <button
            type="button"
            onClick={() => setSlotType('recurring')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${slotType === 'recurring'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Repeat size={16} />
            Recurring Slots
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <TextInput
          label="Title"
          placeholder="Session Title"
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
          })}
        />
        {errors.title?.message && <ErrorMessage error={errors.title.message} />}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 text-sm"
          rows={3}
          {...register('description', {
            required: 'Description is required',
            minLength: {
              value: 10,
              message: 'Description must be at least 10 characters',
            },
          })}
        />
        {errors.description?.message && (
          <ErrorMessage error={errors.description.message} />
        )}
      </div>

      {/* Tags Input */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (Press Enter or Comma to add)
        </label>
        <div className="flex flex-wrap gap-2 p-2 border rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-600 cursor-pointer dark:hover:text-blue-400"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={
              currentTags.length === 0
                ? 'e.g. React, Career, System Design'
                : ''
            }
            className="flex-1 min-w-[100px] bg-transparent outline-none dark:text-white text-sm"
          />
        </div>
      </div>

      {/* ==================== Scheduling Details ==================== */}
      {slotType === 'single' ? (
        /* Single Slot Scheduling */
        <div className="grid grid-cols-2 gap-4">
          <div>
            <TextInput
              label="Start Time"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              {...register('scheduledAt', {
                required:
                  slotType === 'single' ? 'Start time is required' : false,
                validate: (value) => {
                  if (slotType !== 'single') return true;
                  const date = new Date(value);
                  const now = new Date();
                  return date > now || 'Start time must be in the future';
                },
              })}
            />
            {errors.scheduledAt?.message && (
              <ErrorMessage error={errors.scheduledAt.message} />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Duration
            </label>
            <select
              className="w-full px-4 py-2 mt-1 cursor-pointer rounded-lg shadow-sm border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 text-sm"
              {...register('duration', {
                required: 'Duration is required',
                valueAsNumber: true,
              })}
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
            {errors.duration?.message && (
              <ErrorMessage error={errors.duration.message} />
            )}
          </div>
        </div>
      ) : (
        /* Recurring Slots Scheduling */
        <div className="space-y-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Repeat size={14} />
              Recurrence Pattern
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${frequency === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${frequency === 'daily'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                Daily
              </button>
            </div>
          </div>

          {/* Days of week chips (Weekly only) */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repeat On Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                        }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Range & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slot Time
              </label>
              <input
                type="time"
                value={recurringTime}
                onChange={(e) => setRecurringTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Duration in Recurring Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (each slot)
              </label>
              <select
                className="w-full px-3 py-2 cursor-pointer rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 text-sm"
                {...register('duration', {
                  required: 'Duration is required',
                  valueAsNumber: true,
                })}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            {/* Estimated Slots Counter Badge */}
            <div className="flex items-center">
              <div className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>~{estimatedSlotCount} slots</strong> will be generated
                  in this date range.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing & Status */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <TextInput
            label="Price (INR)"
            type="number"
            icon={<IndianRupee className="w-5 h-5 text-gray-400" />}
            {...register('price', {
              required: 'Price is required',
              validate: (value) => {
                const numValue = Number(value);
                if (numValue === 0) return true;
                return numValue >= 99 || 'Price must be at least ₹99.00 or free';
              },
              valueAsNumber: true,
            })}
          />
          {errors.price?.message && <ErrorMessage error={errors.price.message} />}
        </div>

        {initialData?.status && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
              {...register('status' as keyof CreateSlotRequest)}
            >
              <option value={SlotStatus.AVAILABLE}>Available</option>
              <option value={SlotStatus.MAINTENANCE}>Maintenance</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 cursor-pointer bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-sm transition-all"
        >
          {slotType === 'recurring' && !isEditMode ? (
            <>
              <Repeat size={16} />
              {isLoading ? 'Creating Series...' : `Create ${estimatedSlotCount} Slots`}
            </>
          ) : (
            <>{isLoading ? 'Saving...' : isEditMode ? 'Update Slot' : 'Save Slot'}</>
          )}
        </button>
      </div>
    </form>
  );
};
