import { Link } from 'react-router-dom'

interface ErrorProps  {
    message:string
    statusCode:number
}

const ErrorPage = ({message,statusCode}:ErrorProps) => {
  return (
     <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
      {/* Main Content */}
      <h1 className="text-9xl font-extrabold text-gray-300 dark:text-gray-700 select-none">
       {statusCode} 
      </h1>
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {message}
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
        Thank you for your understanding.
      </p>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
      >
        Back to Home
      </Link>

      {/* Optional Illustration */}
      <div className="mt-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-40 h-40 text-gray-200 dark:text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L15.75 12L9.75 7"
          />
        </svg>
      </div>
    </div>
  )
}

export default ErrorPage

