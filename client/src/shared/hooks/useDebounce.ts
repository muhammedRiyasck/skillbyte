import { useState, useEffect } from "react";

// Custom Hook
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(handler); // cleanup on re-render
    };
  }, [value, delay]);

  return debouncedValue;
};
