import { Trash2, Plus } from "lucide-react";
import TextInput from "../../../shared/ui/TextInput";

type DynamicFieldProps = {
  points:string[]
  setPoints:(value:string[])=>void
}

export default function DynamicField({points, setPoints}:DynamicFieldProps) {
  

  const handleAddField = () => {
    if(points.length >=6) return 
    setPoints([...points, ""]);
  };

  const handleRemoveField = (index: number) => {
    const updatedPoints = points.filter((_, i) => i !== index);
    setPoints(updatedPoints);
  };

  const handleChange = (index: number, value: string) => {
    const updatedPoints = [...points];
    updatedPoints[index] = value;
    setPoints(updatedPoints);
  };

  return (
    <div className="w-full bg-white p-2 rounded-2xl shadow-md space-y-4 dark:bg-gray-700 dark:border dark:border-white">

      {points.map((point, index) => (
        <div key={index} className="w-full flex gap-2 ">
          <div className="w-[95%]">
            <TextInput
              id="point"
              type='text'
              placeholder={`Enter point ${index + 1}`}
              value={point}
              setValue={(value)=>handleChange(index,value)}
              className="dark:bg-gray-700 dark:border dark:border-white "
            />
          </div>
          {points.length > 1 && (
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
