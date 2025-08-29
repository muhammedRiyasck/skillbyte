import Shimmer from "./Shimmer"
const Home = () => {
  return (
    <div className="w-full rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700">
      {/* Hero Section Shimmer */}
      <div className="px-4 md:px-8 py-10 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2">
            {/* Heading shimmer */}
            <Shimmer height={40} width="80%" />
            <Shimmer height={40} width="60%" className="mt-2" />
            
            {/* Paragraph shimmer */}
            <div className="my-6">
              <Shimmer height={16} width="100%" />
              <Shimmer height={16} width="90%" className="mt-2" />
              <Shimmer height={16} width="95%" className="mt-2" />
              <Shimmer height={16} width="85%" className="mt-2" />
            </div>
            
            {/* Buttons shimmer */}
            <div className="flex gap-4">
              <Shimmer height={40} width={120} />
              <Shimmer height={40} width={100} />
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            {/* Image area shimmer */}
            <Shimmer height={300} width="80%" />
          </div>
        </div>
      </div>
      
      {/* Features Section Shimmer */}
      <div className="px-4 md:px-8 py-12 bg-gray-400/20 dark:bg-gray-800">
        {/* Section heading shimmer */}
        <div className="text-center mb-8">
          <Shimmer height={30} width="50%" className="mx-auto" />
        </div>
