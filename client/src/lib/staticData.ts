import type { WaitlistEntry } from "@shared/schema";

// Initial static demo data (only used in static GitHub Pages build)
const staticWaitlistEntries: WaitlistEntry[] = [
  { id: 1, email: "example1@example.com", createdAt: new Date("2023-01-15") },
  { id: 2, email: "example2@example.com", createdAt: new Date("2023-02-10") },
  { id: 3, email: "example3@example.com", createdAt: new Date("2023-03-25") },
];

// Static data store (simulates API for static site)
class StaticDataStore {
  private waitlist: WaitlistEntry[] = [...staticWaitlistEntries];
  private isAdminAuthenticated = false;

  // Waitlist operations
  async addToWaitlist(email: string): Promise<Response> {
    // Find the highest ID and increment by 1
    const maxId = this.waitlist.reduce((max, entry) => Math.max(max, entry.id), 0);
    
    const newEntry: WaitlistEntry = {
      id: maxId + 1,
      email,
      createdAt: new Date()
    };
    
    this.waitlist.push(newEntry);
    
    return new Response(JSON.stringify({ 
      message: "Successfully added to waitlist",
      entry: newEntry
    }), { 
      status: 201, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getAllWaitlistEntries(): Promise<Response> {
    if (!this.isAdminAuthenticated) {
      return new Response(JSON.stringify({ 
        message: "Unauthorized" 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(this.waitlist), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async deleteWaitlistEntry(id: number): Promise<Response> {
    if (!this.isAdminAuthenticated) {
      return new Response(JSON.stringify({ 
        message: "Unauthorized" 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = this.waitlist.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      return new Response(JSON.stringify({ 
        message: "Entry not found" 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    this.waitlist.splice(index, 1);
    
    return new Response(JSON.stringify({ 
      message: "Entry deleted successfully" 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Admin operations
  async loginAdmin(username: string, password: string): Promise<Response> {
    // In demo static mode, use simple credentials
    if (username === "admin" && password === "admin") {
      this.isAdminAuthenticated = true;
      return new Response(JSON.stringify({ 
        success: true 
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Invalid credentials" 
    }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async logoutAdmin(): Promise<Response> {
    this.isAdminAuthenticated = false;
    return new Response(JSON.stringify({ 
      success: true 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async checkAdminAuth(): Promise<Response> {
    return new Response(JSON.stringify({ 
      isAuthenticated: this.isAdminAuthenticated 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async sendPromotionalEmail(message?: string): Promise<Response> {
    if (!this.isAdminAuthenticated) {
      return new Response(JSON.stringify({ 
        message: "Unauthorized" 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // In static mode, just return a success response
    return new Response(JSON.stringify({ 
      message: "Email functionality is disabled in static demo mode",
      success: true,
      emailsSent: this.waitlist.length
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async sendLaunchAnnouncement(): Promise<Response> {
    if (!this.isAdminAuthenticated) {
      return new Response(JSON.stringify({ 
        message: "Unauthorized" 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // In static mode, just return a success response
    return new Response(JSON.stringify({ 
      message: "Email functionality is disabled in static demo mode",
      success: true,
      emailsSent: this.waitlist.length
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Create a singleton instance
export const staticDataStore = new StaticDataStore();