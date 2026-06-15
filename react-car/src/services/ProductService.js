import api from "./api";

export const getProducts = async () => {
  const response = await api.get("/cars");
  return response.data.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data.data;
};
