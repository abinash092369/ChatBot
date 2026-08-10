import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/types';

export interface ApiClientOptions {
  baseURL: string;
  getAccessToken?: () => string | null;
  onRefreshToken?: () => Promise<string | null>;
  onAuthError?: () => void;
}

export class ApiClient {
  private instance: AxiosInstance;
  private getAccessToken?: () => string | null;
  private onRefreshToken?: () => Promise<string | null>;
  private onAuthError?: () => void;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(options: ApiClientOptions) {
    this.getAccessToken = options.getAccessToken;
    this.onRefreshToken = options.onRefreshToken;
    this.onAuthError = options.onAuthError;

    this.instance = axios.create({
      baseURL: options.baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        if (this.getAccessToken) {
          const token = this.getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && this.onRefreshToken) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.instance(originalRequest));
              });
            });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.onRefreshToken();
            this.isRefreshing = false;

            if (newToken) {
              this.refreshSubscribers.forEach((cb) => cb(newToken));
              this.refreshSubscribers = [];
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            } else {
              if (this.onAuthError) this.onAuthError();
            }
          } catch (refreshErr) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            if (this.onAuthError) this.onAuthError();
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.get<ApiResponse<T>>(url, config);
    return res.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.post<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.put<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.delete<ApiResponse<T>>(url, config);
    return res.data;
  }

  public getRawInstance(): AxiosInstance {
    return this.instance;
  }
}
