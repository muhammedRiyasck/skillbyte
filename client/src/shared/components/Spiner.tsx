const Spiner = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 dark:bg-gray-900 text-gray-700 dark:text-gray-200 backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        <span className="text-lg font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default Spiner;
