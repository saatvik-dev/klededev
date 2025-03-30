import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";

// Check if we're on GitHub Pages
const isGitHubPages = () => {
  return typeof window !== 'undefined' && 
         import.meta.env.PROD && 
         window.location.hostname.endsWith('github.io');
};

// Since using the full wouter Router with a custom hook is challenging due to type issues,
// Let's use a simpler approach with standard routing and manual base path handling

function Router() {
  // Get the correct base path (empty for local dev, repo name for GitHub Pages)
  const getBasePath = () => {
    if (isGitHubPages() && import.meta.env.BASE_URL) {
      return import.meta.env.BASE_URL.endsWith('/') 
        ? import.meta.env.BASE_URL.slice(0, -1) 
        : import.meta.env.BASE_URL;
    }
    return '';
  };
  
  const basePath = getBasePath();
  
  // Debug log for development
  if (import.meta.env.DEV) {
    console.log(`Base path for routes: ${basePath}`);
  }
  
  return (
    <Switch>
      <Route path={`${basePath}/`} component={Home} />
      <Route path={`${basePath}/admin`} component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
