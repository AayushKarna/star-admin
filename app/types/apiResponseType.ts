export interface ApiResponse<T> {
  isSuccess: boolean;
  message?: string;
  data: {
    data: T;
  };
}
