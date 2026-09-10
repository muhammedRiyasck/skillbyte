const footer = () => {
  return (
  <footer
    className="
      border-t
      border-gray-200
      bg-white
      text-gray-500
      dark:border-gray-800
      dark:bg-[#050914]
      dark:text-gray-400
    "
  >
    <div
      className="
        mx-auto
        flex
        max-w-[1600px]
        flex-col
        items-center
        justify-center
        px-4
        py-5
        sm:px-6
        lg:px-8
      "
    >
      <p className="text-xs sm:text-sm text-center">
        &copy; 2025 Skillbyte. All rights reserved.
      </p>
    </div>
  </footer>
);
};

export default footer;
