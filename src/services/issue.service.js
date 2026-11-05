// frontend/src/services/issue.service.js
import { api } from "../lib/api";

export const issueService = {
  // Create issue (guest, requires auth)
  createIssue: async (data) => {
    try {
      console.log("[issueService] Creating issue with data:", data);
      const response = await api.post("/api/issues/create.php", data);
      console.log("[issueService] Issue created successfully:", response);
      return response;
    } catch (error) {
      console.error("[issueService] Error creating issue:", error);
      throw error;
    }
  },

  // Get guest's issues
  getGuestIssues: async () => {
    try {
      const response = await api.get("/api/issues/guest");
      return response;
    } catch (error) {
      console.error("[issueService] Error getting guest issues:", error);
      throw error;
    }
  },

  // Get single issue details
  getIssue: async (issueId) => {
    try {
      const response = await api.get(`/api/issues/${issueId}`);
      return response;
    } catch (error) {
      console.error("[issueService] Error getting issue details:", error);
      throw error;
    }
  },
};

// Admin issue endpoints
export const adminIssueService = {
  // List all issues
  listIssues: (status = "") => {
    const url = status
      ? `/api/admin/issues/list.php?status=${encodeURIComponent(status)}`
      : `/api/admin/issues/list.php`;
    return api.get(url);
  },

  // Update issue status
  updateIssueStatus: (issueId, status, assignedToUserId = null) => {
    const data = {
      issue_id: issueId,
      status,
    };
    if (assignedToUserId) {
      data.assigned_to_user_id = assignedToUserId;
    }
    return api.post("/api/admin/issues/update_status.php", data);
  },

  // Get issue details
  getIssueDetails: (issueId) =>
    api.get(`/api/admin/issues/${issueId}`),
};
