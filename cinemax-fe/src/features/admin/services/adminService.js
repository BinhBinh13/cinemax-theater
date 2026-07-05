import axiosClient from "@/shared/services/axiosClient";

const adminService = {
  // Movies CRUD
  getMovies: async () => {
    const response = await axiosClient.get("/api/v1/movies");
    return response.data;
  },
  createMovie: async (movieData) => {
    const response = await axiosClient.post("/api/v1/movies", movieData);
    return response.data;
  },
  updateMovie: async (id, movieData) => {
    const response = await axiosClient.put(`/api/v1/movies/${id}`, movieData);
    return response.data;
  },
  deleteMovie: async (id) => {
    await axiosClient.delete(`/api/v1/movies/${id}`);
  },

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

  // Concessions CRUD
  getConcessions: async () => {
    const response = await axiosClient.get("/api/v1/concessions");
    return response.data;
  },
  createConcession: async (concessionData) => {
    const response = await axiosClient.post("/api/v1/concessions", concessionData);
    return response.data;
  },
  updateConcession: async (id, concessionData) => {
    const response = await axiosClient.put(`/api/v1/concessions/${id}`, concessionData);
    return response.data;
  },
  deleteConcession: async (id) => {
    await axiosClient.delete(`/api/v1/concessions/${id}`);
  }
};

export default adminService;
