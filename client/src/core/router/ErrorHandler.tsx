import { useRouteError } from 'react-router-dom';
import ErrorPage from '@shared/ui/ErrorPage';
import { HttpStatusCode } from '@shared/constants/HttpStatusCode';

interface RouteError {
  status?: number;
  statusText?: string;
}

const ErrorHandler = () => {
  const error = useRouteError();

  let message = 'An unexpected error occurred';
  let statusCode = 500;

  if (error && typeof error === 'object' && 'status' in error) {
    const routeError = error as RouteError;
    statusCode = routeError.status || HttpStatusCode.INTERNAL_SERVER_ERROR;
    if (statusCode === HttpStatusCode.NOT_FOUND) {
      message = 'Page Not Found';
    } else {
      message = routeError.statusText || 'Error';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return <ErrorPage message={message} statusCode={statusCode} />;
};

export default ErrorHandler;
