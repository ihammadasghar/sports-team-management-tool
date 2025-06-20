const API_BASE_URL = "http://127.0.0.1:8000/api"; // Replace with your Django API URL

export const getToken = () => localStorage.getItem("authToken");
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || JSON.stringify(errorData) || "Something went wrong"
    );
  }
  return response.json();
};

export const api = {
  auth: {
    register: (userData) =>
      fetchWithAuth(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        body: JSON.stringify(userData),
        headers: { "Content-Type": "application/json" },
      }),
    login: (credentials) =>
      fetchWithAuth(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "Content-Type": "application/json" },
      }),
    logout: () =>
      fetchWithAuth(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
      }),
  },
  teams: {
    getAll: () => fetchWithAuth(`${API_BASE_URL}/teams/`),
    getById: (teamId) => fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/`),
    create: (teamData) =>
      fetchWithAuth(`${API_BASE_URL}/teams/`, {
        method: "POST",
        body: JSON.stringify(teamData),
      }),
    join: (teamId, username, role) =>
      fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/add-member/`, {
        method: "POST",
        body: JSON.stringify({ username, role }),
      }),
  },
  posts: {
    getByTeam: (teamId) =>
      fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/posts/`),
    getById: (teamId, postId) =>
      fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/posts/${postId}/`),
    addComment: (teamId, postId, commentContent) =>
      fetchWithAuth(
        `${API_BASE_URL}/teams/${teamId}/posts/${postId}/comments/`,
        {
          method: "POST",
          body: JSON.stringify({ content: commentContent }),
        }
      ),
    // New: Create a post for a specific team
    create: (teamId, postData) =>
      fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/posts/`, {
        method: "POST",
        body: JSON.stringify(postData),
      }),
  },
  events: {
    getByTeam: (teamId) =>
      fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/events/`),
    // New: Create an event for a specific team
    create: (teamId, eventData) =>
      fetchWithAuth(`${API_BASE_URL}/teams/${teamId}/events/`, {
        method: "POST",
        body: JSON.stringify(eventData),
      }),
  },
};
