import React from 'react';

interface CourseDescriptionProps {
  description: string;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({
  description,
}) => {
  return (
    <section className="border-b border-gray-200 py-10 dark:border-gray-800">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
        About this course
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-gray-950 dark:text-white sm:text-3xl">
        Description
      </h2>

      <p className="mt-5 max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
        {description}
      </p>
    </section>
  );
};

export default CourseDescription;
