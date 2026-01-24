import { useForm } from 'react-hook-form';
import TextInput from '@shared/ui/TextInput';
import ErrorMessage from '@shared/ui/ErrorMessage';
import type { CreateSlotRequest } from '../types/mentorshipTypes';
import { useEffect, useState } from 'react';
import { IndianRupee } from 'lucide-react';

interface SlotFormProps {
  initialData?: Partial<CreateSlotRequest>;
  onSubmit: (data: CreateSlotRequest) => void;
  isLoading?: boolean;
}

export const SlotForm = ({ initialData, onSubmit, isLoading }: SlotFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateSlotRequest>({
    mode: 'onChange',
    defaultValues: {
      duration: 60,
      price: 0,
      title: 'Mentorship Session',
      tags: [],
      ...initialData,
    }
  });

  const [tagInput, setTagInput] = useState('');
  const currentTags = watch('tags') || [];

  // Handle Date conversion for input type="datetime-local"
  useEffect(() => {
    if (initialData?.scheduledAt) {
      const date = new Date(initialData.scheduledAt);
      const offset = date.getTimezoneOffset() * 60000;
      const localIso = new Date(date.getTime() - offset).toISOString().slice(0, 16);
      setValue('scheduledAt', localIso ); 
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
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const onFormSubmit = (data: CreateSlotRequest) => {
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

      {/* Tags Input */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags (Press Enter or Comma to add)</label>
        <div className="flex flex-wrap gap-2 p-2 border rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
            {currentTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-600 cursor-pointer dark:hover:text-blue-400">
                        &times;
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={currentTags.length === 0 ? "e.g. React, Career, JavaScript" : ""}
                className="flex-1 min-w-[100px] bg-transparent outline-none dark:text-white text-sm"
            />
        </div>
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
          {/* duration must be [30, 45, 60, 90] */}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
          <select
            className="w-full px-4 py-2  cursor-pointer rounded-lg shadow-sm border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            {...register('duration', { 
              required: 'Duration is required', 
              valueAsNumber: true 
            })}
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
          </div>
            {errors.duration?.message && <ErrorMessage error={errors.duration.message} />}
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
                validate: (value) => {
                  const numValue = Number(value);
                  if (numValue === 0) return true;
                  return numValue >= 99 || 'Price must be at least ₹99.00 or free';
                },
                valueAsNumber: true
            })}
            />
            {errors.price?.message && <ErrorMessage error={errors.price.message} />}
        </div>

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
