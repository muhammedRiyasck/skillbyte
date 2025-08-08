import React from 'react'

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  
  return (
    <p className="text-red-800 text-center my-2">{error}</p>
  );
}


export default ErrorMessage

