import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@core/store/Index";
import { ROUTES } from "@/core/router/paths";

type HeroSectionProps = {
  steps: () => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({ steps }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <section className="px-4 md:px-8 py-10 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
      <div className="md:w-1/2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-600 dark:text-white">
          Skill up. <br />Shine brighter. 
           {/* all in one place */}
        </h1>
           {/* <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-600 dark:text-white">
          Sign. Simplify. <br />
          Secure.
        </h1> */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base">
          Discover a platform where learners and instructors come together to grow, teach, and succeed. Gain in-demand
          skills from industry experts or share your knowledge and turn your expertise into income — all in one seamless
          experience.
        </p>
        {!user && (
          <div className="flex justify-center md:justify-start gap-4 ">
            <button
              onClick={() => steps()}
              className="bg-gray-600 text-white px-5 py-2 rounded-md text-sm hover:opacity-90 cursor-pointer lg:text-lg font-medium"
            >
              Get Started
            </button>

            <Link
              to={ROUTES.auth.learnerRegister}
              className="border border-gray-400 dark:border-gray-500 text-sm px-5 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:text-lg font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <div className="md:w-1/2">
        {/* <img
            src="https://images.unsplash.com/photo-1556742041-1b55c8a61d40"
            alt="Preview"
            className="rounded-lg shadow-lg w-full max-w-md mx-auto"
          /> */}
      </div>
    </section>
  );
};

export default HeroSection;
