import axiosClient from "@/shared/services/axiosClient";

const adminService = {
  // Users CRUD
  getUsers: async () => {
    const response = await axiosClient.get("/api/v1/users");
    return response.data;
  },
  createUser: async (userData) => {
    const response = await axiosClient.post("/api/v1/users", userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await axiosClient.put(`/api/v1/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    await axiosClient.delete(`/api/v1/users/${id}`);
  },
  getRoles: async () => {
    const response = await axiosClient.get("/api/v1/users/roles");
    return response.data;
  },
};

export default adminService;
