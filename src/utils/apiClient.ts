import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { BASE_URL } from "../constants/apiConstants";
import { getAuthToken } from "../contexts/AuthContextInstance";

const defaultTimeoutMs = 15000;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: defaultTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(config => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === "ERR_CANCELED") {
      console.warn("Запрос отменен:", error.message);
      return Promise.reject(error);
    }

    if (error.response) {
      console.error("Ошибка ответа API", {
        url: error.config?.url ?? error.config?.baseURL,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    } else {
      console.error("Ошибка сети при обращении к API", error);
    }

    return Promise.reject(error);
  }
);

export type ApiRequestConfig<T = unknown> = AxiosRequestConfig<T>;

export const createRequestController = () => new AbortController();

export function withCancelSignal<T>(
  config: ApiRequestConfig<T>,
  controller?: AbortController
): ApiRequestConfig<T> {
  if (!controller) {
    return config;
  }

  return {
    ...config,
    signal: controller.signal,
  };
}

export async function requestWithAuth<T = unknown>(
  config: ApiRequestConfig<T>
): Promise<AxiosResponse<T>> {
  return apiClient.request<T>(config);
}

export function createCancelableRequest<T = unknown>(
  config: ApiRequestConfig<T>
): {
  controller: AbortController;
  promise: Promise<AxiosResponse<T>>;
} {
  const controller = createRequestController();
  const promise = apiClient.request<T>({
    ...config,
    signal: controller.signal,
  });

  return { controller, promise };
}

export { apiClient };
