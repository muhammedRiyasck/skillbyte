

type TextInputProps = {
    type:string
    id:string;
    placeholder: string;
    value: string;
    setValue: (value: string) => void;
    error: string;
}

const TextInput = ({type,id,value,placeholder,setValue,error}:TextInputProps) => {
  return (
    <div>
         <input
              type={type}
              id={id}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              // className={`mt-1 w-full border  rounded-md px-3 py-2  ${error ? 'border-red-950':'border-gray-300'} `}
              required
            />
    </div>
  )
}

export default TextInput

