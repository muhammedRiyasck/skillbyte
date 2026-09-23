import type { AxiosError } from "axios";

interface ApiErrorResponseData {
  message?: string;
}


export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorResponseData>;
  return axiosError?.response?.data?.message ?? fallback;
}
