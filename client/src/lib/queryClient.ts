import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { staticDataStore } from "./staticData";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Check if we're running in GitHub Pages static mode
const isGitHubPagesStatic = () => {
  return typeof window !== 'undefined' && 
         import.meta.env.PROD && 
         window.location.hostname.endsWith('github.io');
};

/**
 * Helper function to get the correct API URL for different environments:
 * - In development, API calls go directly to the path
 * - In production on Netlify, API calls go to /.netlify/functions/api-standalone
 * - On GitHub Pages static deployment, we use the in-memory data store
 */
function getApiUrl(path: string): string {
  // Make sure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If running in a browser and we're in production
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const baseUrl = window.location.origin;
    
    // Check if we're on GitHub Pages
    if (isGitHubPagesStatic()) {
      // For GitHub Pages, we'll handle the request in the fetch function
      // using our staticDataStore, but we still need to return a URL
      return normalizedPath;
    }
    
    // For API paths, remap to Netlify Functions path
    if (normalizedPath.startsWith('/api/')) {
      // Change /api/something to /.netlify/functions/api-standalone.cjs/something
      return `${baseUrl}/.netlify/functions/api-standalone.cjs${normalizedPath.substring(4)}`;
    }
    
    // For non-API paths, just use the normal URL
    return `${baseUrl}${normalizedPath}`;
  }
  
  // In development mode, just use the path directly
  return normalizedPath;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // If in GitHub Pages static mode, use the static data store
  if (isGitHubPagesStatic() && url.startsWith('/api/')) {
    // Handle static data requests
    if (url === '/api/waitlist' && method === 'POST') {
      return staticDataStore.addToWaitlist((data as any).email);
    }
    else if (url === '/api/admin/login' && method === 'POST') {
      return staticDataStore.loginAdmin((data as any).username, (data as any).password);
    }
    else if (url === '/api/admin/logout' && method === 'POST') {
      return staticDataStore.logoutAdmin();
    }
    else if (url === '/api/admin/waitlist' && method === 'GET') {
      return staticDataStore.getAllWaitlistEntries();
    }
    else if (url.startsWith('/api/admin/waitlist/') && method === 'DELETE') {
      const id = parseInt(url.split('/').pop() || '0');
      return staticDataStore.deleteWaitlistEntry(id);
    }
    else if (url === '/api/admin/check' && method === 'GET') {
      return staticDataStore.checkAdminAuth();
    }
    else if (url === '/api/admin/send-promotional' && method === 'POST') {
      return staticDataStore.sendPromotionalEmail((data as any)?.message);
    }
    else if (url === '/api/admin/send-launch-announcement' && method === 'POST') {
      return staticDataStore.sendLaunchAnnouncement();
    }
    
    // Default case for unhandled static API requests
    return new Response(JSON.stringify({ error: 'Not implemented in static mode' }), { 
      status: 501, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // For normal environments, use the real API
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
    const path = queryKey[0] as string;
    
    // If in GitHub Pages static mode, use the static data store for API queries
    if (isGitHubPagesStatic() && path.startsWith('/api/')) {
      let response: Response;
      
      // Handle specific API paths
      if (path === '/api/admin/waitlist') {
        response = await staticDataStore.getAllWaitlistEntries();
      } 
      else if (path === '/api/admin/check') {
        response = await staticDataStore.checkAdminAuth();
      }
      else {
        // Default response for unhandled paths
        response = new Response(JSON.stringify({ error: 'Not implemented in static mode' }), { 
          status: 501, 
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (unauthorizedBehavior === "returnNull" && response.status === 401) {
        return null;
      }
      
      await throwIfResNotOk(response);
      return await response.json();
    }
    
    // For normal environments, use the real API
    const apiUrl = getApiUrl(path);
    
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
