import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type DropDownProps = {
  options: string[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleListStatus: (option: string) => void;
  selectedValue: string;
};

const DropDown: React.FC<DropDownProps> = ({
  options,
  isOpen,
  setIsOpen,
  handleListStatus,
  selectedValue ,
}) => {
    return <div className="relative">
          <div
            className="border border-gray-300 text-center w-full sm:w-48 rounded-xl px-5 py-3 dark:text-gray-200 shadow-md cursor-pointer bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedValue}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 rounded-xl mt-2 shadow-xl z-10 overflow-hidden">
              <div className="py-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="px-5 py-3 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-900 dark:hover:to-gray-900 cursor-pointer transition-colors duration-150 mx-2 my-1 rounded-lg font-medium"
                    onClick={() => handleListStatus(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
};

export default DropDown;

