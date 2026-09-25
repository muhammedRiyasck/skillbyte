import React from 'react'

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  
  return (
    // <p className="text-red-800 text-center ">{error}</p>
        <span className="text-red-600 dark:text-red-600 text-center my-2">{error}</span>

  );
}


export default ErrorMessage

