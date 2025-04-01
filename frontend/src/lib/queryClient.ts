import { QueryClient } from '@tanstack/react-query';

/**
 * Helper function to throw an error if the response is not OK
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    let errorData: { error: string; message?: string } = { error: 'Unknown error' };
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      errorData.error = errorText || 'Server error';
    }
    throw new Error(errorData.message || errorData.error);
  }
}

/**
 * Helper function to get the correct API URL for both development and production
 * In development, API calls go directly to the path
 * In production, API calls go to the configured backend URL (Vercel) for API requests
 * and to the regular URL for non-API requests
 */
function getApiUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // In development or if no API URL is configured, use the same origin
  if (!apiUrl) {
    return path;
  }
  
  // In production, use the configured API URL for API requests
  if (path.startsWith('/api/')) {
    return `${apiUrl}${path}`;
  }
  
  // For non-API requests, use the same origin
  return path;
}

/**
 * General-purpose API request function
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  await throwIfResNotOk(res);

  if (res.status === 204) {
    return {} as T; // No content
  }

  return res.json();
}

/**
 * Type for handling 401 (Unauthorized) errors
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates a query function with specific options
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => (key: string) => Promise<T | null> = (options) => {
  return async (path: string) => {
    try {
      return await apiRequest<T>(path);
    } catch (e) {
      // Check if it's a 401 error
      if (
        e instanceof Error &&
        e.message.toLowerCase().includes('unauthorized')
      ) {
        if (options.on401 === 'returnNull') {
          return null;
        }
        throw e;
      }
      throw e;
    }
  };
};

/**
 * TanStack Query client configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryFn: getQueryFn({ on401: 'throw' }),
    },
  },
});