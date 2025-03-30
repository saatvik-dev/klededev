import { apiRequest } from "./queryClient";

export async function addToWaitlist(email: string) {
  let firstAttemptError: string = '';
  
  try {
    // First attempt: regular API path
    console.log("Attempting to add to waitlist with standard path");
    return await apiRequest("POST", "/api/waitlist", { email });
  } catch (error) {
    console.error("First attempt failed:", error);
    
    // Store first error message for later reference
    if (error instanceof Error) {
      firstAttemptError = error.message;
    } else {
      firstAttemptError = 'Unknown error during first attempt';
    }
    
    // Second attempt: try direct Netlify function path
    try {
      console.log("Attempting to add to waitlist with direct Netlify function path");
      const baseUrl = window.location.origin;
      const directUrl = `${baseUrl}/.netlify/functions/api-standalone/api/waitlist`;
      
      console.log(`Making direct request to: ${directUrl}`);
      const response = await fetch(directUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error(`Direct request failed with status: ${response.status}`);
      }
      
      return response;
    } catch (secondError) {
      console.error("Second attempt failed:", secondError);
      
      let secondErrorMessage = 'Unknown error during second attempt';
      if (secondError instanceof Error) {
        secondErrorMessage = secondError.message;
      }
      
      throw new Error(`Failed to submit waitlist form. Errors: [1] ${firstAttemptError} [2] ${secondErrorMessage}`);
    }
  }
}

export async function loginAdmin(username: string, password: string) {
  return apiRequest("POST", "/api/admin/login", { username, password });
}

export async function logoutAdmin() {
  return apiRequest("POST", "/api/admin/logout", {});
}

export async function getAllWaitlistEntries() {
  return apiRequest("GET", "/api/admin/waitlist");
}

export async function deleteWaitlistEntry(id: number) {
  return apiRequest("DELETE", `/api/admin/waitlist/${id}`);
}

export async function checkAdminAuth() {
  return apiRequest("GET", "/api/admin/check");
}

/**
 * Send a promotional email to all waitlist subscribers
 * @param message Optional custom message to include in the email
 */
export async function sendPromotionalEmail(message?: string) {
  return apiRequest("POST", "/api/admin/send-promotional", { message });
}

/**
 * Send a launch announcement email to all waitlist subscribers
 */
export async function sendLaunchAnnouncement() {
  return apiRequest("POST", "/api/admin/send-launch-announcement", {});
}
