// import React, { useEffect, useState } from "react";

// const ThemeToggle: React.FC = () => {
//   const [theme, setTheme] = useState<"light" | "dark">(
//     localStorage.theme === "dark" ? "dark" : "light"
//   );

//   useEffect(() => {
//     const root = window.document.documentElement;
//     if (theme === "dark") {
//         console.log("Dark mode enabled");
//       root.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//         console.log("Light mode enabled");
//       root.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }, [theme]);

//   return (
//     <button
//       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//       className="px-3 py-1 border rounded-md text-sm"
//     >
//       {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
//     </button>
//   );
// };

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

