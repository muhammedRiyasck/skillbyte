
const UploadProgressBar = ({ progress }: { progress: number }) => {
  return (
    <>
  {progress<100&& <div className="relative mt-2 h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>}
    </>
  );
};

export default UploadProgressBar;
