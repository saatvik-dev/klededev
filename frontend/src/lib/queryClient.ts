import { 
  QueryClient,
  QueryKey,
  QueryFunction
} from '@tanstack/react-query';

/**
 * Helper function to check if a response is OK and throw an error if not
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse error from response
    let errorMessage = `Server responded with ${res.status}: ${res.statusText}`;
    let errorData = null;
    
    try {
      errorData = await res.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Unable to parse JSON, use status text
    }
    
    const error = new Error(errorMessage) as Error & { status?: number, data?: any };
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
}

/**
 * Helper function to get the correct API URL for both development and production
 */
function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // In production, use the environment variable for the API URL
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  }
  
  // In development, just use the path (proxied by Vite)
  return `/${cleanPath}`;
}

/**
 * Generic API request function to handle API calls
 * 
 * @param path - The API path to call (with or without leading slash)
 * @param options - Fetch options (method, headers, body)
 * @returns The parsed response data
 */
export async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = getApiUrl(path);
  
  // Setup default headers for JSON
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Combine provided options with our defaults
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Send cookies for authentication
  };
  
  // Convert body to JSON string if it's an object
  if (
    fetchOptions.body &&
    typeof fetchOptions.body === 'object' &&
    !(fetchOptions.body instanceof FormData) &&
    !(fetchOptions.body instanceof URLSearchParams)
  ) {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }
  
  const response = await fetch(url, fetchOptions);
  await throwIfResNotOk(response);
  
  // Return parsed JSON or null if no content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

/**
 * Create a query function with configurable behavior on 401 errors
 */
export const getQueryFn = <T>(options: {
  on401: 'returnNull' | 'throw',
}): QueryFunction<T, QueryKey> => {
  return async ({ queryKey }) => {
    try {
      const [path] = queryKey as string[];
      return await apiRequest(path);
    } catch (error: any) {
      if (error.status === 401 && options.on401 === 'returnNull') {
        return null as T;
      }
      throw error;
    }
  };
};

/**
 * Configure the query client with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      queryFn: getQueryFn({ on401: 'throw' }),
    },
  },
});