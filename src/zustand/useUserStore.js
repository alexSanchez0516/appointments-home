import { create } from "zustand";

export const useUserStore = create((set) => {
  const storedUser = localStorage.getItem("user");
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    user: initialUser,
    loginUser: (user) => {
      set({ user });
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(user));
    },
    logOut: () => {
      set({ user: null });
      // Remove user from localStorage
      localStorage.removeItem("user");
    },
  };
});