import Shimmer from "./Shimmer";

export default function InstructorRequestShimmer() {
  return (
    <div className="w-full min-h-screen  shadow-sm bg-gray-100 dark:bg-gray-700 p-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 mb-4">
        <Shimmer height={40} width="100%" />
        <Shimmer height={40} width="100%" />
        <Shimmer height={40} width="100%" />
        <Shimmer height={40} width="100%" />
        <Shimmer height={40} width="100%" />
        <Shimmer height={40} width="100%" />
        <Shimmer height={40} width="100%" />
      </div>

      {/* Table Rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-4 mb-4">
          <Shimmer height={50} width="40%" />
          <Shimmer height={50} width="100%" />
          <Shimmer height={50} width="100%" />
          <Shimmer height={50} width="100%" />
          <Shimmer height={50} width="100%" />
          <Shimmer height={50} width="100%" />
          <Shimmer height={50} width="60%" />
        </div>
      ))}
    </div>
  );
}
