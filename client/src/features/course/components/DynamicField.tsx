import { Trash2, Plus } from "lucide-react";
import TextInput from "@shared/ui/TextInput";
import { useFieldArray } from "react-hook-form";
import type { Control } from "react-hook-form";

type DynamicFieldProps =
  | {
      control: Control<any>;
      name: string;
      placeholder: string;
      data?: never;
      setData?: never;
    }
  | {
      data: string[];
      setData: (value: string[]) => void;
      placeholder: string;
      control?: never;
      name?: never;
    };

export default function DynamicField(props: DynamicFieldProps) {
  const { placeholder } = props;

  if (props.control && props.name) {
    const { fields, append, remove } = useFieldArray({
      control: props.control,
      name: props.name,
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
              <TextInput
                id={`point-${index}`}
                type="text"
                placeholder={`Enter ${placeholder} ${index + 1}`}
                {...props.control.register(`${props.name}.${index}`)}
                className="dark:bg-gray-700 dark:border dark:border-white"
              />
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="text-red-500 hover:text-red-700 transition cursor-pointer flex items-center"
              >
                <Trash2 size={18} />
              </button>
            )}
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
  } else if (props.data ) {
    const { data, setData } = props;

    const handleAddField = () => {
      if (data.length >= 6) return;
      setData([...data, ""]);
    };

    const handleRemoveField = (index: number) => {
      const updateddata = data.filter((_, i) => i !== index);
      setData(updateddata);
    };

    const handleChange = (index: number, value: string) => {
      const updateddata = [...data];
      updateddata[index] = value;
      setData(updateddata);
    };

    return (
      <div className="w-full p-2 rounded-lg shadow-md space-y-4 dark:bg-gray-700 dark:border dark:border-white">
        {data.map((point, index) => (
          <div key={index} className="w-full flex gap-2">
            <div className="w-[95%]">
              <TextInput
                id={`point-${index}`}
                type="text"
                placeholder={`Enter ${placeholder} ${index + 1}`}
                value={point}
                onChange={(e) => handleChange(index, e.target.value)}
                className="dark:bg-gray-700 dark:border dark:border-white"
              />
            </div>
            {data.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="text-red-500 hover:text-red-700 transition cursor-pointer flex items-center"
              >
                <Trash2 size={18} />
              </button>
            )}
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

  return null;
}
