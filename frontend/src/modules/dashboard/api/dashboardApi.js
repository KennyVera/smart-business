import api from "../../../api/client";

export function fetchAdminDashboard() {
  return api.get("/api/pos/admin-dashboard/");
}
