import React from "react";
import {
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Learn at your pace",
    description:
      "Follow structured courses and learn whenever it fits your schedule.",
    icon: BookOpen,
  },
  {
    title: "Built for real skills",
    description:
      "Focus on practical knowledge that you can apply beyond the classroom.",
    icon: Zap,
  },
  {
    title: "Simple experience",
    description:
      "A focused interface keeps your learning journey clear and distraction-free.",
    icon: LayoutDashboard,
  },
  {
    title: "Track your progress",
    description:
      "Keep track of what you've learned and continue exactly where you left off.",
    icon: Gauge,
  },
  {
    title: "Learn from instructors",
    description:
      "Discover knowledge shared by instructors with experience in their fields.",
    icon: Users,
  },
  {
    title: "Secure by design",
    description:
      "Your account and learning experience are protected with modern security practices.",
    icon: ShieldCheck,
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-24 bg-gray-50 dark:bg-[#080e1b] border-y border-gray-200 dark:border-gray-800/70">

      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">

          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-3">
            Why Skillbyte
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
            Everything you need to keep learning
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-6 text-gray-500 dark:text-gray-400">
            A focused learning experience designed to help learners discover
            useful skills and instructors share their knowledge.
          </p>

        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  relative
                  p-6
                  rounded-2xl
                  border
                  border-gray-200
                  dark:border-gray-800
                  bg-white
                  dark:bg-[#0b1220]
                  hover:border-blue-300
                  dark:hover:border-blue-900
                  shadow-sm
                  hover:shadow-lg
                  dark:hover:shadow-black/20
                  transition-all
                  duration-300
                "
              >

                {/* Number */}
                <div className="absolute top-5 right-5 text-[11px] font-medium text-gray-300 dark:text-gray-700">
                  0{index + 1}
                </div>

                {/* Icon */}
                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-blue-50
                    dark:bg-blue-500/10
                    border
                    border-blue-100
                    dark:border-blue-900/50
                    flex
                    items-center
                    justify-center
                    text-blue-600
                    dark:text-blue-400
                    group-hover:scale-105
                    transition-transform
                    duration-300
                  "
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-gray-950 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;