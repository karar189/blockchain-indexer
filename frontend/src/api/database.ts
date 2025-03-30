import axios from "./axiosInstance";

export const getConnections = () => axios.get("/database");
export const addConnection = (data: any) => axios.post("/database", data);
export const testConnection = (data: any) => axios.post("/database/test", data);
export const deleteConnection = (id: any) => axios.delete(`/database/${id}`);
