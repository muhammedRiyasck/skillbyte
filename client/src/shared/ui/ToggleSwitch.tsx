

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: () => void;
}

export default function ToggleSwitch({ checked = false, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onChange}
        className={`relative inline-flex items-center h-10 w-23 rounded-full transition-colors duration-300 shadow-inner ${
          checked ? "bg-green-800" : "bg-gray-200"
        }`}
        aria-pressed={checked}
        >
        <span
          className={`absolute text-sm  font-bold transition-all duration-300 ${
            checked ? "left-3 text-white" : "right-3 text-gray-700"
          }`}
          >
          {checked ? "Hide" : "Show"}
        </span>
        <span
          className={`absolute left-1 top-1 h-8 w-8 rounded-full bg-white shadow transform transition-transform duration-300 cursor-pointer ${
            checked ? "translate-x-13" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
