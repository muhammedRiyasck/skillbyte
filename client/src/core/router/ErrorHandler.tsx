import { useRouteError } from 'react-router-dom';
import ErrorPage from '@shared/ui/ErrorPage';

const ErrorHandler = () => {
  const error = useRouteError();

  let message = 'An unexpected error occurred';
  let statusCode = 500;

  if (error && typeof error === 'object' && 'status' in error) {
    statusCode = error.status as number;
    if (statusCode === 404) {
      message = 'Page Not Found';
    } else {
      message = (error as any).statusText || 'Error';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return <ErrorPage message={message} statusCode={statusCode} />;
};

export default ErrorHandler;
