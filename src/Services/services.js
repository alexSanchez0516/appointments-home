import axios from "axios";
import { API_URL } from "../constants/contants";

export const deleteAppointment = async (id) => {
  try {
    return await axios.delete(`${API_URL}/evets/${id}`);
  } catch (error) {
    console.error(`Error al eliminar la cita:`, error);
  }
};

export const updateAppointment = async (id, updatedData) => {
  try {
    return await axios.put(`${API_URL}/evets/${id}`, {
      data: updatedData,
    });
  } catch (error) {
    console.error(`Error al actualizar la cita:`, error);
  }
};

export const createAppointment = async (data) => {
  try {
    return await axios.post(`${API_URL}/evets`, {
      data,
    });
  } catch (error) {
    console.error(error);
  }
};

export const createAppointmentRecurrent = async (data) => {
  try {
    return await axios.post(`${API_URL}/relation-events`, {
      data,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAppointmentRecurrent = async (data) => {
  try {
    return await axios.get(`${API_URL}/events-recurrents`, {
      data,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAppointmentsData = async (
  user = null,
  page = 0,
  eventRecurrentID = null
) => {
  const pageSize = 25;
  let url = `${API_URL}/evets?populate=*`;
  if (user !== null && user !== undefined && user !== "" && user !== "Todos") {
    url += `&filters[user][$eq]=${user}`;
  }
  if (
    eventRecurrentID
  ) {
    url += `&filters[events_recurrent_id][$eq]=${eventRecurrentID}`;
  }
  url += `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};

export const getNotes = async () => {
  try {
    return await axios.get(
      `${API_URL}/notes-tasks?populate=*&pagination%5BwithCount%5D=true&pagination%5Bstart%5D=0&pagination%5Blimit%5D=1000`
    );
  } catch (error) {
    console.error(error);
  }
};

export const createNote = async (data) => {
  try {
    return await axios.post(`${API_URL}/notes-tasks`, { data });
  } catch (error) {
    console.error(error);
  }
};
export const deleteNote = async (id) => {
  try {
    return await axios.delete(`${API_URL}/notes-tasks/${id}`);
  } catch (error) {
    console.error(`Error al eliminar la cita:`, error);
  }
};

export const updateNote = async (id, updatedData) => {
  try {
    return await axios.put(`${API_URL}/notes-tasks/${id}`, {
      data: updatedData,
    });
  } catch (error) {
    console.error(`Error al actualizar la cita:`, error);
  }
};
