import { useForm } from 'react-hook-form';
import TextInput from '@shared/ui/TextInput';
import ErrorMessage from '@shared/ui/ErrorMessage';
import type { CreateSlotRequest } from '../types/mentorshipTypes';
import { useEffect } from 'react';
import { Clock, IndianRupee } from 'lucide-react';

interface SlotFormProps {
  initialData?: Partial<CreateSlotRequest>;
  onSubmit: (data: CreateSlotRequest) => void;
  isLoading?: boolean;
}

export const SlotForm = ({ initialData, onSubmit, isLoading }: SlotFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateSlotRequest>({
    mode: 'onChange',
    defaultValues: {
      duration: 60,
      price: 0,
      title: 'Mentorship Session',
      ...initialData,
    }
  });

  // Handle Date conversion for input type="datetime-local"
  // Format: YYYY-MM-DDTHH:mm
  useEffect(() => {
    if (initialData?.scheduledAt) {
      const date = new Date(initialData.scheduledAt);
      // Adjust to local ISO string for input
      // Be careful with timezone offsets here. 'datetime-local' expects local time.
      const offset = date.getTimezoneOffset() * 60000;
      const localIso = new Date(date.getTime() - offset).toISOString().slice(0, 16);
      setValue('scheduledAt', localIso ); 
    }
  }, [initialData, setValue]);

  const onFormSubmit = (data: CreateSlotRequest) => {
    // Convert string date back to Date object
    const payload: CreateSlotRequest = {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      duration: Number(data.duration),
      price: Number(data.price),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      
      {/* Title */}
      <div>
        <TextInput
            label="Title"
            placeholder="Session Title"
            {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
            })}
        />
        {errors.title?.message && <ErrorMessage error={errors.title.message} />}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
          rows={3}
          {...register('description', { 
            required: 'Description is required',
            minLength: { value: 10, message: 'Description must be at least 10 characters' }
          })}
        />
        {errors.description?.message && <ErrorMessage error={errors.description.message} />}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Start Time */}
        <div>
            <TextInput
            label="Start Time"
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            {...register('scheduledAt', { 
                required: 'Start time is required',
                validate: (value) => {
                const date = new Date(value);
                const now = new Date();
                return date > now || 'Start time must be in the future';
                }
            })}
            />
             {errors.scheduledAt?.message && <ErrorMessage error={errors.scheduledAt.message} />}
        </div>

        {/* Duration */}
        <div>
            <TextInput
            label="Duration (minutes)"
            type="number"
            icon={<Clock className="w-5 h-5 text-gray-400" />}
            {...register('duration', { 
                required: 'Duration is required', 
                min: { value: 15, message: 'Minimum duration is 15 minutes' },
                valueAsNumber: true 
            })}
            />
            {errors.duration?.message && <ErrorMessage error={errors.duration.message} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div>
            <TextInput
            label="Price (INR)"
            type="number"
            icon={<IndianRupee className="w-5 h-5 text-gray-400" />}
            {...register('price', { 
                required: 'Price is required', 
                min: { value: 0, message: 'Price cannot be negative' },
                valueAsNumber: true
            })}
            />
            {errors.price?.message && <ErrorMessage error={errors.price.message} />}
        </div>

        {/* Status (Optional, maybe for Edit) */}
        {initialData?.status && (
          <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                  className="w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  {...register('status' as keyof CreateSlotRequest)}
              >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
              </select>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 mt-6">
       
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Slot'}
        </button>
      </div>
    </form>
  );
};
