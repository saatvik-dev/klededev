import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Helper function to get the correct API URL for both development and production
 * In development, API calls go directly to the path
 * In production, API calls go to the configured backend URL (Vercel) for API requests
 * and to the regular URL for non-API requests
 */
function getApiUrl(path: string): string {
  // Make sure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If running in a browser and we're in production
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    // Check if we have a specific backend API URL configured
    const backendApiUrl = import.meta.env.VITE_API_URL;
    
    // For API paths, use the backend URL if available
    if (normalizedPath.startsWith('/api/')) {
      if (backendApiUrl) {
        // If we have a specific backend API URL, use that
        const apiBaseUrl = backendApiUrl.endsWith('/') 
          ? backendApiUrl.slice(0, -1) 
          : backendApiUrl;
        return `${apiBaseUrl}${normalizedPath}`;
      } else {
        // Fall back to the Netlify Functions path if no specific backend is configured
        const baseUrl = window.location.origin;
        return `${baseUrl}/.netlify/functions/api-standalone.cjs${normalizedPath.substring(4)}`;
      }
    }
    
    // For non-API paths, just use the normal URL
    return `${window.location.origin}${normalizedPath}`;
  }
  
  // In development mode, just use the path directly
  return normalizedPath;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const apiUrl = getApiUrl(url);
  
  const res = await fetch(apiUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get appropriate URL for the environment
    const apiUrl = getApiUrl(queryKey[0] as string);
    
    const res = await fetch(apiUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
