import apiClient from './apiClient';

interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  message?: string;
}

class ApiService {
  private static getAuthConfig(sendAuthToken: boolean) {
    const token = localStorage.getItem('authToken');
    return sendAuthToken && token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  }

  static async uploadFile<T = unknown>(file: File): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('files', file);
      const response = await apiClient.post<T>('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log(response.data);

      return { isSuccess: true, data: response.data };
    } catch (err) {
      return this.handleError<T>(err);
    }
  }

  static async uploadFiles<T = unknown>(
    files: File[]
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      [...files].forEach(file => formData.append('files', file));
      const response = await apiClient.post<T>('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log(response.data);

      return { isSuccess: true, data: response.data };
    } catch (err) {
      return this.handleError<T>(err);
    }
  }

  static async get<T = unknown>(
    resource: string,
    sendAuthToken = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<T>(
        resource,
        this.getAuthConfig(sendAuthToken)
      );
      return { isSuccess: true, data: response.data };
    } catch (err) {
      return this.handleError<T>(err);
    }
  }

  static async post<T = unknown>(
    resource: string,
    data: object | FormData,
    sendAuthToken = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<T>(
        resource,
        data,
        this.getAuthConfig(sendAuthToken)
      );
      return { isSuccess: true, data: response.data };
    } catch (err) {
      return this.handleError<T>(err);
    }
  }

  static async patch<T = unknown>(
    resource: string,
    data: object | FormData,
    sendAuthToken = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<T>(
        resource,
        data,
        this.getAuthConfig(sendAuthToken)
      );
      return { isSuccess: true, data: response.data };
    } catch (err) {
      return this.handleError<T>(err);
    }
  }

  static async delete<T = unknown>(
    resource: string,
    sendAuthToken = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<T>(
        resource,
        this.getAuthConfig(sendAuthToken)
      );
      return { isSuccess: true, data: response.data };
    } catch (err) {
      return this.handleError<T>(err);
    }
  }

  private static handleError<T>(err: unknown): ApiResponse<T> {
    let errorMessage = 'An unexpected error occurred.';

    if (err instanceof Error) {
      errorMessage = err.message;
    }

    if (typeof err === 'object' && err !== null && 'response' in err) {
      const errorResponse = err as {
        response: {
          data?: { message?: string };
          statusText?: string;
          status?: number;
        };
      };
      errorMessage =
        errorResponse.response.data?.message ||
        errorResponse.response.statusText ||
        `Error: ${errorResponse.response.status}`;
    }

    console.error(err);
    return { isSuccess: false, data: undefined, message: errorMessage };
  }
}

export default ApiService;
