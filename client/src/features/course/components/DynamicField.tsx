import { Trash2, Plus } from "lucide-react";
import TextInput from "@shared/ui/TextInput";
import { useFieldArray, Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

type DynamicFieldProps = {
  control: Control<any>;
  name: string;
  placeholder: string;
};

export default function DynamicField({ control, name, placeholder }: DynamicFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });

  const handleAddField = () => {
    if (fields.length >= 6) return;
    append("");
  };

  const handleRemoveField = (index: number) => {
    remove(index);
  };

  return (
    <div className="w-full p-2 rounded-lg shadow-md space-y-4 dark:bg-gray-700 dark:border dark:border-white">
      {fields.map((field, index) => (
        <div key={field.id} className="w-full flex gap-2">
          <div className="w-[95%]">
            <Controller
              control={control}
              name={`${name}.${index}`}
              render={({ field }) => (
                <TextInput
                  id={`point-${index}`}
                  type="text"
                  placeholder={`Enter ${placeholder} ${index + 1}`}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="dark:bg-gray-700 dark:border dark:border-white"
                />
              )}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveField(index)}
            disabled={fields.length <= 1}
            className="text-red-500 hover:text-red-700 transition cursor-pointer flex items-center disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleAddField}
      >
        <Plus size={18} />
        Add More
      </button>
    </div>
  );
}
