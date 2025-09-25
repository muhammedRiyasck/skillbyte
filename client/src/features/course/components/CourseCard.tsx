
interface courses {
    id: string,
    title: string 
    subText:string
    description:string 
    rating: number,
    reviews: string 
    language: string 
    thumbnailUrl: string 
    status:string
}

interface CourseCardProps {
    courses: courses[];
}

const CourseCard = ({ courses }: CourseCardProps) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 cursor-pointer my-12 ">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition p-4 flex flex-col"
            >
              <div className="rounded-md overflow-hidden mb-4 relative">
                <span className={`text-white z-1 absolute right-2 top-2 px-4 rounded-md ${c.status==='draft'?'bg-orange-400':c.status==='unlist'?'bg-red-600':''} `}>{c.status==='draft'?'Drafted':c.status==='unlist'?' Unlisted':''}</span>
                <img
                  src={c.thumbnailUrl}
                  alt={c.title}
                  className="w-full h-48 object-cover"
                />
              </div>

              <h2 className="text-black dark:text-white text-xl font-semibold">{c.title}</h2>

              <div className="flex items-center mt-2 text-black  dark:text-gray-300 text-sm gap-3 ">
                <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                  PREMIUM
                </span>
                <span>{c.language}</span>
                <span>⭐ {c.rating} ({c.reviews} Reviews)</span>
              </div>

              <p className="text-black dark:text-gray-400 text-sm mt-3 flex-grow ">
                {c.subText}
              </p>

              <button className={`mt-4   text-white font-medium py-2 rounded transition cursor-pointer ${c.status === 'list'?'bg-red-700 hover:bg-red-900':c.status === 'unlist'?'bg-green-700 hover:bg-green-900':'bg-indigo-500 hover:bg-indigo-600'}`}>
                {c.status === 'draft'?'Continue Upload ':c.status === 'list'?'Unlist The Course':'List The Course'}
              </button>
            </div>
          ))}
        </div>
  )
}

export default CourseCard

