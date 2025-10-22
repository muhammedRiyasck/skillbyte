import { Trash2, Plus } from "lucide-react";
import TextInput from "@shared/ui/TextInput";

type DynamicFieldProps = {
  data:string[]
  setData:(value:string[])=>void
  placeholder:string
}

export default function DynamicField({data, setData,placeholder}:DynamicFieldProps) {
  

  const handleAddField = () => {
    if(data.length >=6) return 
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
    <div className="w-full  p-2 rounded-lg shadow-md space-y-4 dark:bg-gray-700 dark:border dark:border-white">

      {data.map((point, index) => (
        <div key={index} className="w-full flex gap-2 ">
          <div className="w-[95%]">
            <TextInput
              id="point"
              type={ 'text' }
              placeholder={`Enter ${placeholder} ${index + 1}`}
              value={point}
              onChange={(value)=>handleChange(index,value)}
              className="dark:bg-gray-700 dark:border dark:border-white "
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
