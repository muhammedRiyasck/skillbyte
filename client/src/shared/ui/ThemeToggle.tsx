import { useTheme } from "../../core/store/Theme-Context";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded  hover:cursor-pointer border border-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-white"
    >
      {theme === "light" ? "🌙 " : "☀️ "}
    </button>
  );
};

export default ThemeToggle;
