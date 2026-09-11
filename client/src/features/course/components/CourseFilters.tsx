import React, { useCallback } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { DebouncedInput } from '@/shared/ui';
import { CourseCategory } from '@shared/enums/CourseCategory';
import { CourseLevel } from '@shared/enums/CourseLevel';

interface CourseFiltersProps {
  filters: {
    category: CourseCategory | '';
    level: CourseLevel | '';
    priceRange: string;
    sort: string;
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<CourseFiltersProps['filters']>>;
  categories: string[];
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters,
  setFilters,
  categories,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setFilters((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    },
    [setFilters],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev: CourseFiltersProps['filters']) => ({
        ...prev,
        search: value,
      }));
    },
    [setFilters],
  );

 return (
  <div className="pb-4 sm:pb-5">
    <div
      className="
        grid
        grid-cols-2
        gap-2.5
        sm:gap-3
        lg:grid-cols-[minmax(280px,2fr)_repeat(4,minmax(140px,1fr))]
        items-end
      "
    >
      {/* Search */}
      <div className="col-span-2 lg:col-span-1">
        <div className="relative">
          <DebouncedInput
            id="search"
            type="text"
            value={filters.search}
            setValue={handleSearchChange}
            placeholder="Search by title, skill, or instructor..."
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <div className="relative">
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="
              w-full
              h-10
              sm:h-11
              appearance-none
              rounded-xl
              border
              border-gray-200
              dark:border-gray-800
              bg-gray-50
              dark:bg-[#0b1220]
              px-3
              sm:px-3.5
              pr-9
              text-sm
              text-gray-800
              dark:text-gray-200
              outline-none
              transition-all
              duration-200
              hover:border-gray-300
              dark:hover:border-gray-700
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              cursor-pointer
            "
          >
            <option value="">All categories</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat || "Uncategorized"}
              </option>
            ))}
          </select>

          <ChevronDown
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-gray-400
            "
          />
        </div>
      </div>

      {/* Level */}
      <div>
        <div className="relative">
          <select
            name="level"
            value={filters.level}
            onChange={handleChange}
            className="
              w-full
              h-10
              sm:h-11
              appearance-none
              rounded-xl
              border
              border-gray-200
              dark:border-gray-800
              bg-gray-50
              dark:bg-[#0b1220]
              px-3
              sm:px-3.5
              pr-9
              text-sm
              text-gray-800
              dark:text-gray-200
              outline-none
              transition-all
              duration-200
              hover:border-gray-300
              dark:hover:border-gray-700
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              cursor-pointer
            "
          >
            <option value="">All levels</option>

            {Object.values(CourseLevel).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <ChevronDown
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-gray-400
            "
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="relative">
          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={handleChange}
            className="
              w-full
              h-10
              sm:h-11
              appearance-none
              rounded-xl
              border
              border-gray-200
              dark:border-gray-800
              bg-gray-50
              dark:bg-[#0b1220]
              px-3
              sm:px-3.5
              pr-9
              text-sm
              text-gray-800
              dark:text-gray-200
              outline-none
              transition-all
              duration-200
              hover:border-gray-300
              dark:hover:border-gray-700
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              cursor-pointer
            "
          >
            <option value="">All prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <ChevronDown
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-gray-400
            "
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <div className="relative">
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="
              w-full
              h-10
              sm:h-11
              appearance-none
              rounded-xl
              border
              border-gray-200
              dark:border-gray-800
              bg-gray-50
              dark:bg-[#0b1220]
              px-3
              sm:px-3.5
              pr-9
              text-sm
              text-gray-800
              dark:text-gray-200
              outline-none
              transition-all
              duration-200
              hover:border-gray-300
              dark:hover:border-gray-700
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              cursor-pointer
            "
          >
            <option value="createdAt:desc">
              Newest first
            </option>

            <option value="createdAt:asc">
              Oldest first
            </option>

            <option value="price:asc">
              Price: low to high
            </option>

            <option value="price:desc">
              Price: high to low
            </option>

            <option value="title:asc">
              Name: A-Z
            </option>

            <option value="title:desc">
              Name: Z-A
            </option>
          </select>

          <SlidersHorizontal
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-gray-400
            "
          />
        </div>
      </div>
    </div>
  </div>
);
};

export default CourseFilters;
