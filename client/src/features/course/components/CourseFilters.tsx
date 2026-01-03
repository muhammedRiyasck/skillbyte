import React, { useCallback } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { DebouncedInput } from '@/shared/ui';

interface CourseFiltersProps {
  filters: {
    category: string;
    level: string;
    priceRange: string;
    sort: string;
    search: string;
  };
  setFilters: (
    filters: (
      prev: CourseFiltersProps['filters'],
    ) => CourseFiltersProps['filters'],
  ) => void;
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
    <div className="bg-white z-10 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 lg:mx-2">
      {/* Search Bar */}
      <div className="relative mb-6">
        <DebouncedInput
          id="search"
          type="text"
          value={filters.search}
          setValue={handleSearchChange}
          placeholder="Search courses..."
        ></DebouncedInput>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Category
          </label>
          <div className="relative">
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat || 'Uncategorized'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Level Filter */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Level
          </label>
          <div className="relative">
            <select
              name="level"
              value={filters.level}
              onChange={handleChange}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Price Filter */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Price
          </label>
          <div className="relative">
            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleChange}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort Order */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sort By
          </label>
          <div className="relative">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleChange}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="title:asc">Name: A-Z</option>
              <option value="title:desc">Name: Z-A</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>

  );
};

export default CourseFilters;
