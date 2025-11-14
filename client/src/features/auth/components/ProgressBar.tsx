import { User, Briefcase } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { title: "Personal Details", icon: User },
    { title: "Professional Details", icon: Briefcase },
  ];

  return (
    <div className="mt-6 mb-8 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          return (
            <div key={index} className="flex flex-col items-center min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-indigo-600 text-white"
                    : isActive
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Icon size={20} />
              </div>
              <span
                className={`mt-2 text-xs md:text-lg font-medium text-center ${
                  isActive || isCompleted
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
