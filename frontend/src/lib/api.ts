/**
 * AIMIKO Unified API Client
 * Seamlessly interfaces with FastAPI backend (/api/v1) for auth, buddy, billing, and admin.
 */

const API_BASE = "/api/v1";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("aimiko_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ─── AUTHENTICATION ──────────────────────────────────────────────────────────
  auth: {
    async register(data: { email: string; password?: string; full_name?: string; role?: string; organization_name?: string }) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ access_token: string; user: any }>(res);
      if (result.access_token) {
        localStorage.setItem("aimiko_token", result.access_token);
      }
      return result;
    },

    async login(data: { email: string; password?: string }) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ access_token: string; user: any }>(res);
      if (result.access_token) {
        localStorage.setItem("aimiko_token", result.access_token);
      }
      return result;
    },

    async googleLogin(idToken: string, role?: string) {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ id_token: idToken, role: role || "student" }),
      });
      const result = await handleResponse<{ access_token: string; user: any }>(res);
      if (result.access_token) {
        localStorage.setItem("aimiko_token", result.access_token);
      }
      return result;
    },

    async getMe() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<any>(res);
    },

    async updateProfile(data: { role?: string; full_name?: string }) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },

    logout() {
      localStorage.removeItem("aimiko_token");
      document.cookie = "aimiko_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
  },

  // ─── AIMIKO BUDDY (CHAT, NOTES, PLANNER) ───────────────────────────────────
  buddy: {
    async chat(data: { message: string; role?: string; age_group?: string | null; conversation_id?: number | null; mode?: string }) {
      const res = await fetch(`${API_BASE}/buddy/chat`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<{
        conversation_id: number;
        user_message: string;
        ai_response: string;
        tokens_used: number;
        created_at: string;
      }>(res);
    },

    async getConversations() {
      const res = await fetch(`${API_BASE}/buddy/conversations`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<Array<{ id: number; title: string; mode: string; created_at: string; updated_at: string }>>(res);
    },

    async getConversationMessages(convId: number) {
      const res = await fetch(`${API_BASE}/buddy/conversations/${convId}/messages`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<Array<{ id: number; conversation_id: number; role: string; content: string; created_at: string }>>(res);
    },

    async getNotes() {
      const res = await fetch(`${API_BASE}/buddy/notes`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<Array<{ id: number; title: string; content: string; folder: string; tags_json: string[]; created_at: string; updated_at: string }>>(res);
    },

    async createNote(data: { title: string; content: string; folder?: string; tags?: string[] }) {
      const res = await fetch(`${API_BASE}/buddy/notes`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },

    async updateNote(noteId: number, data: { title?: string; content?: string; folder?: string; tags?: string[] }) {
      const res = await fetch(`${API_BASE}/buddy/notes/${noteId}`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },

    async deleteNote(noteId: number) {
      const res = await fetch(`${API_BASE}/buddy/notes/${noteId}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<any>(res);
    },

    async getTasks() {
      const res = await fetch(`${API_BASE}/buddy/tasks`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<Array<{ id: number; title: string; priority: string; scheduled_date: string; is_completed: boolean; created_at: string }>>(res);
    },

    async createTask(data: { title: string; priority?: string; scheduled_date?: string }) {
      const res = await fetch(`${API_BASE}/buddy/tasks`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },

    async updateTask(taskId: number, data: { title?: string; priority?: string; scheduled_date?: string; is_completed?: boolean }) {
      const res = await fetch(`${API_BASE}/buddy/tasks/${taskId}`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },

    async deleteTask(taskId: number) {
      const res = await fetch(`${API_BASE}/buddy/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<any>(res);
    },
  },

  // ─── BILLING & PAYMENTS ────────────────────────────────────────────────────
  billing: {
    async createOrder(planName: string, gateway: "razorpay" | "stripe" = "razorpay") {
      const res = await fetch(`${API_BASE}/billing/create-order`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ plan_name: planName, gateway }),
      });
      return handleResponse<any>(res);
    },

    async verifyPayment(data: {
      gateway: "razorpay" | "stripe";
      payment_id?: string;
      order_id?: string;
      signature?: string;
      session_id?: string;
      plan_name: string;
      amount: number;
      currency?: string;
    }) {
      const res = await fetch(`${API_BASE}/billing/verify-payment`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
  },

  // ─── OWNER / ADMIN LEDGER & TELEMETRY ─────────────────────────────────────
  admin: {
    async getStats() {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<any>(res);
    },

    async getUsers(page = 1, pageSize = 50, role = "", search = "") {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (role) params.set("role", role);
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<any>(res);
    },

    async getTransactions(limit = 100) {
      const res = await fetch(`${API_BASE}/admin/transactions?limit=${limit}`, {
        headers: getHeaders(),
        credentials: "include",
      });
      return handleResponse<any>(res);
    },

    async updateUser(userId: number, data: { role?: string; tier?: string; is_active?: boolean }) {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
  },
};
