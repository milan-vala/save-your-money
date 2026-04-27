export interface FetchConfig extends RequestInit {
  url: string;
}

export interface FetchInterceptor {
  onRequest?: (config: FetchConfig) => Promise<FetchConfig>;
  onResponse?: (response: Response) => Promise<Response>;
  onError?: (error: Error) => Promise<void>;
}

class HttpClient {
  private interceptors: FetchInterceptor[] = [];
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private baseUrl =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
    "";

  /**
   * Add an interceptor to the client
   */
  addInterceptor(interceptor: FetchInterceptor): void {
    this.interceptors.push(interceptor);
  }

  /**
   * Make a fetch request with interceptors
   */
  private resolveUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    if (!this.baseUrl) {
      throw new Error("VITE_API_URL is not configured");
    }
    return `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  private async requestRaw(
    url: string,
    config: RequestInit
  ): Promise<Response> {
    const response = await fetch(url, config);
    if (response.status !== 401) return response;
    if (
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/session")
    ) {
      return response;
    }

    try {
      await this.refreshToken();
    } catch {
      return response;
    }
    return fetch(url, config);
  }

  async request<T = unknown>(
    url: string,
    config: RequestInit = {}
  ): Promise<T> {
    let fetchConfig: FetchConfig = { url: this.resolveUrl(url), ...config };

    // Apply request interceptors
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        fetchConfig = await interceptor.onRequest(fetchConfig);
      }
    }

    try {
      let response = await this.requestRaw(fetchConfig.url, fetchConfig);

      // Apply response interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.onResponse) {
          response = await interceptor.onResponse(response);
        }
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: response.statusText }));

        const detail =
          errorData.detail ||
          errorData.error ||
          response.statusText ||
          "Request failed";
        const error = new Error(`${response.status}: ${String(detail)}`);
        throw error;
      }

      if (response.status === 204) {
        return undefined as T;
      }
      return (await response.json()) as T;
    } catch (error) {
      // Apply error interceptors and rethrow
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          await interceptor.onError(error as Error);
        }
      }
      throw error;
    }
  }

  /**
   * Attempt to refresh the access token
   */
  async refreshToken(): Promise<void> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(this.resolveUrl("/api/auth/refresh"), {
          method: "POST",
          credentials: "include", // Include cookies
        });

        if (!response.ok) {
          throw new Error("Token refresh failed");
        }
      } catch (error) {
        await fetch(this.resolveUrl("/api/auth/logout"), {
          method: "POST",
          credentials: "include",
        }).catch(() => {
          // best-effort cookie cleanup
        });
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// Create singleton instance
const httpClient = new HttpClient();

// Add default request interceptor
httpClient.addInterceptor({
  onRequest: async (config) => {
    // Ensure credentials are included for cookies
    config.credentials = "include";

    // Set default headers
    if (!config.headers) {
      config.headers = {};
    }

    const headers = config.headers as Record<string, string>;
    if (!headers["Content-Type"] && config.method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    return config;
  },
});

// Add default response interceptor for token refresh
httpClient.addInterceptor({
  onResponse: async (response) => {
    if (response.status === 403 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return response;
  },
});

// Add default error interceptor
httpClient.addInterceptor({
  onError: async (error) => {
    console.error("HTTP Client Error:", error);
    throw error;
  },
});

export default httpClient;
