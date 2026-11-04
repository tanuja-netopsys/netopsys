import type {
  JobPosting,
  CategoryItem,
  ApplicationItem,
  ApplicationStatus,
  InterviewRound,
  InterviewBooking,
  AdminUser,
} from "../admin/admin-dashboard";

const BASE_URL = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Health
  health: {
    check: () => request<{ success: boolean; backend: string; database: { connected: boolean; message: string; timestamp?: string } }>("/health"),
  },

  // Jobs
  jobs: {
    getAll: () => request<JobPosting[]>("/jobs"),
    save: (job: JobPosting) =>
      request<JobPosting>("/jobs", {
        method: "POST",
        body: JSON.stringify(job),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/jobs/${id}`, {
        method: "DELETE",
      }),
  },

  // Categories
  categories: {
    getAll: () => request<CategoryItem[]>("/categories"),
    save: (category: CategoryItem) =>
      request<CategoryItem>("/categories", {
        method: "POST",
        body: JSON.stringify(category),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/categories/${id}`, {
        method: "DELETE",
      }),
  },

  // Applications
  applications: {
    getAll: () => request<ApplicationItem[]>("/applications"),
    save: (app: ApplicationItem) =>
      request<ApplicationItem>("/applications", {
        method: "POST",
        body: JSON.stringify(app),
      }),
    updateStatus: (id: string, status: ApplicationStatus) =>
      request<ApplicationItem>(`/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/applications/${id}`, {
        method: "DELETE",
      }),
  },

  // Interviews & Availability
  interviews: {
    getAvailability: () =>
      request<Record<string, "available" | "unavailable">>("/interviews/availability"),
    saveAvailability: (updates: Record<string, "available" | "unavailable">) =>
      request<{ message: string }>("/interviews/availability", {
        method: "POST",
        body: JSON.stringify(updates),
      }),
    getRounds: () => request<InterviewRound[]>("/interviews/rounds"),
    saveRounds: (rounds: InterviewRound[]) =>
      request<{ message: string }>("/interviews/rounds", {
        method: "POST",
        body: JSON.stringify(rounds),
      }),
    getBookings: () => request<InterviewBooking[]>("/interviews/bookings"),
    saveBooking: (booking: InterviewBooking) =>
      request<InterviewBooking>("/interviews/bookings", {
        method: "POST",
        body: JSON.stringify(booking),
      }),
    deleteBooking: (id: string) =>
      request<{ message: string }>(`/interviews/bookings/${id}`, {
        method: "DELETE",
      }),
  },

  // Users
  users: {
    getAll: () => request<AdminUser[]>("/users"),
    save: (user: AdminUser) =>
      request<AdminUser>("/users", {
        method: "POST",
        body: JSON.stringify(user),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/users/${id}`, {
        method: "DELETE",
      }),
  },
};
