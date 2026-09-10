import  { forwardRef } from "react";
import {
  UserPlus,
  MailCheck,
  LogIn,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up with your email and create your Skillbyte account.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Verify your email",
    desc: "Confirm your email address and keep your account secure.",
    icon: MailCheck,
  },
  {
    step: "03",
    title: "Start learning",
    desc: "Sign in, explore courses and start building new skills.",
    icon: LogIn,
  },
];

interface StepsSectionProps {
  highlight: boolean;
}

const StepsSection = forwardRef<HTMLElement, StepsSectionProps>(
  ({ highlight }, ref) => {
    return (
      <section
        ref={ref}
        className={`
          relative
          px-4
          sm:px-6
          lg:px-8
          py-24
          transition-all
          duration-500
          ${
            highlight
              ? "bg-blue-50 dark:bg-blue-500/5"
              : "bg-white dark:bg-[#050914]"
          }
        `}
      >
        <div className="max-w-[1100px] mx-auto">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">

            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-3">
              Getting started
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
              Start learning in three simple steps
            </h2>

            <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              No complicated setup. Create your account and get straight into
              learning.
            </p>

          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Connector */}
            <div className="hidden md:block absolute top-[42px] left-[16.5%] right-[16.5%] border-t border-dashed border-gray-300 dark:border-gray-800" />

            {steps.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className="
                    relative
                    rounded-2xl
                    border
                    border-gray-200
                    dark:border-gray-800
                    bg-white
                    dark:bg-[#0b1220]
                    p-6
                    shadow-sm
                  "
                >

                  {/* Icon */}
                  <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Step */}
                  <p className="mt-5 text-[11px] font-semibold tracking-widest text-blue-600 dark:text-blue-400">
                    STEP {item.step}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-gray-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-medium text-gray-400">
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      </section>
    );
  }
);

StepsSection.displayName = "StepsSection";

export default StepsSection;