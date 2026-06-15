import api from "./api";

export const getCars = async () => {
  const response = await api.get("/cars");
  return response.data.data;
};

export const getCarById = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data.data;
};

export const createCar = async (formData) => {
  const response = await api.post("/cars", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateCar = async (id, formData) => {
  formData.append("_method", "PUT");
  const response = await api.post(`/cars/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteCar = async (id) => {
  const response = await api.delete(`/cars/${id}`);
  return response.data;
};
