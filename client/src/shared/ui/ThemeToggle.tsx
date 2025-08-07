
import { useTheme } from "../lib/theme-context";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded  hover:cursor-pointer border bg-gray-100 dark:bg-gray-800 dark:text-white"
    >
      {theme === "light" ? "🌙 " : "☀️ "}
    </button>
  );
};

export default ThemeToggle;

