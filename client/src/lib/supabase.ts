import { apiRequest } from "./queryClient";

export async function addToWaitlist(email: string) {
  return apiRequest("POST", "/api/waitlist", { email });
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
