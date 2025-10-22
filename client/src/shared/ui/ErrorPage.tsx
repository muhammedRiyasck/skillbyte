import { Link } from 'react-router-dom'

interface ErrorProps  {
    message:string
    statusCode:number
}

const ErrorPage = ({message,statusCode}:ErrorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-300 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-300 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-300 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-600 dark:from-indigo-400 dark:to-gray-800 select-none animate-pulse">
          {statusCode}
        </h1>
        <h2 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {message}
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
          We're sorry for the inconvenience. Please try again later or contact support if the problem persists.
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="mt-8 inline-block px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-400 hover:to-gray-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Back to Home
        </Link>

        {/* Illustration */}
        <div className="mt-12 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-48 h-48 text-gray-400 dark:text-gray-600 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage

