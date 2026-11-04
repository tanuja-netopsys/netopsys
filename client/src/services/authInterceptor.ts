/**
 * Global Fetch Interceptor
 * Automatically injects the JWT bearer token into all administrative API requests.
 * Handles 401 Unauthorized responses by clearing credentials and triggering logout.
 */
if (typeof window !== "undefined") {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof (input as Request).url === "string") {
      url = (input as Request).url;
    }

    // Attach JWT Authorization header to protected admin endpoints
    if (
      url.includes("/api/admin/") ||
      url.includes("/api/superadmin/") ||
      url.includes("/api/upload")
    ) {
      const token = localStorage.getItem("netopsys_admin_token");
      if (token) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        init.headers = headers;
      }
    }

    const response = await originalFetch(input, init);

    // If backend returns 401 Unauthorized on admin endpoint, clear auth state
    if (
      response.status === 401 &&
      (url.includes("/api/admin/") || url.includes("/api/superadmin/")) &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/superadmin/login")
    ) {
      localStorage.removeItem("netopsys_admin_token");
      localStorage.removeItem("netopsys_admin_user");
      window.dispatchEvent(new Event("admin-auth-change"));
    }

    return response;
  };
}

export {};

