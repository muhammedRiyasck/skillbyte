import Shimmer from "./Shimmer"

const Home = () => {
  return (
    <div className="w-full shadow-sm bg-gray-100 dark:bg-gray-900 p-4 space-y-6">
      {/* Hero Section */}
        <Shimmer height={80} width="100%" />
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Shimmer height={400} width="100%" />
      </div>
      
      {/* Features Section */}
      <div className="space-y-4 bg-gray-100 dark:bg-gray-900">
        <Shimmer height={40} width="30%" style={{ marginBottom: "20px" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-100 dark:bg-gray-900">
          <Shimmer height={200} width="100%" />
          <Shimmer height={200} width="100%" />
          <Shimmer height={200} width="100%" />
          <Shimmer height={200} width="100%" />
          <Shimmer height={200} width="100%" />
          <Shimmer height={200} width="100%" />
        </div>
      </div>
      
      <div className="grid grid-cols-1  gap-6">
        <Shimmer height={300} width="100%" />
      
      </div>
    </div>
  )
}

export default Home

