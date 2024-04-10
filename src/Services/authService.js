import axios from "axios";
import { API_URL } from "../constants/contants";
const authService = {
  login: async (body) => {
    const response = await axios.post(
      `${API_URL}/auth/local`,
      body
    );
    return response.data;
  },
  getUserById: async (
    id
  ) => {
    const response = await axios.get(
      `${API_URL}/users/${id}?populate=*`
    );
    return response.data;
  },
};

export default authService;