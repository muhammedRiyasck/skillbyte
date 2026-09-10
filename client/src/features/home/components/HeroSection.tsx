import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "@/core/router/paths";
import type { RootState } from "@/core/store/Index";


interface HeroSectionProps {
  steps: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ steps }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-20 lg:pb-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute top-[35%] -right-40 h-[350px] w-[350px] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-14 lg:gap-20">

          {/* LEFT */}
          <div className="max-w-3xl text-center lg:text-left">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/70 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />

              Learn. Build. Grow.
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-bold
                tracking-[-0.04em]
                leading-[0.98]
                text-gray-950
                dark:text-white
              "
            >
              Skill up.
              <br />

              <span className="text-blue-600 dark:text-blue-400">
                Shine brighter.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="
                mt-7
                max-w-2xl
                mx-auto
                lg:mx-0
                text-base
                sm:text-lg
                leading-7
                text-gray-600
                dark:text-gray-400
              "
            >
              Discover practical courses from instructors who know their
              craft. Learn in-demand skills, build your knowledge, and turn
              what you know into something bigger.
            </motion.p>

            {/* Buttons */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3"
              >
                <button
                  onClick={steps}
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    h-12
                    px-6
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    dark:bg-blue-600
                    dark:hover:bg-blue-500
                    text-white
                    text-sm
                    font-semibold
                    shadow-lg
                    shadow-blue-600/20
                    transition-all
                    duration-200
                    cursor-pointer
                  "
                >
                  Get Started

                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <Link
                  to={ROUTES.auth.learnerRegister}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    h-12
                    px-6
                    rounded-xl
                    border
                    border-gray-200
                    dark:border-gray-800
                    bg-white
                    dark:bg-[#0b1220]
                    text-gray-800
                    dark:text-gray-200
                    text-sm
                    font-semibold
                    hover:bg-gray-50
                    dark:hover:bg-gray-800/70
                    transition-all
                    duration-200
                  "
                >
                  Create an account
                </Link>
              </motion.div>
            )}

            {/* Small trust row */}
            <div className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Learn at your pace
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Practical learning
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Expert instructors
              </span>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative"
          >
            {/* Outer glow */}
            <div className="absolute inset-10 bg-blue-500/10 blur-[80px] rounded-full" />

            {/* Main card */}
            <div
              className="
                relative
                rounded-3xl
                border
                border-gray-200
                dark:border-gray-800
                bg-white
                dark:bg-[#0b1220]
                shadow-2xl
                dark:shadow-black/30
                overflow-hidden
              "
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />

                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Skillbyte
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Course preview
                </div>
              </div>

              {/* Course preview */}
              <div className="p-5 sm:p-6">

                {/* Video area */}
                <div
                  className="
                    relative
                    aspect-video
                    rounded-2xl
                    overflow-hidden
                    bg-gradient-to-br
                    from-blue-950
                    via-[#101b35]
                    to-[#050914]
                    border
                    border-blue-900/40
                  "
                >
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-8 left-10 w-32 h-32 rounded-full bg-blue-500 blur-3xl" />
                    <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-blue-700 blur-3xl" />
                  </div>

                  <div className="relative h-full flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                      <Play
                        className="w-5 h-5 text-white ml-0.5"
                        fill="white"
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1 rounded-full bg-white/20">
                      <div className="w-[42%] h-full rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Course information */}
                <div className="mt-5">
                  <div className="flex items-center gap-2 text-xs text-blue-500 dark:text-blue-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    Full Stack Development
                  </div>

                  <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                    Build skills that move you forward
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Learn through structured lessons, practical projects and
                    real-world concepts.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-5">

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#101827] border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs">Lessons</span>
                    </div>

                    <p className="mt-1 text-lg font-semibold">
                      24
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#101827] border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Learners</span>
                    </div>

                    <p className="mt-1 text-lg font-semibold">
                      1.2k+
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -bottom-5
                -left-4
                sm:-left-8
                p-3
                sm:p-4
                rounded-2xl
                border
                border-gray-200
                dark:border-gray-800
                bg-white/95
                dark:bg-[#0b1220]/95
                backdrop-blur-xl
                shadow-xl
              "
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    Ready to learn?
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Join now and start learning
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;