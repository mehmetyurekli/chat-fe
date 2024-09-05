import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    id: null, // will be changed with jwt
  }),
  actions: {
    setId(id) {
      this.id = id;
      localStorage.setItem("id", id);
    },
    loadId() {
      this.id = localStorage.getItem("id");
    },
    clearId() {
      this.id = null;
      localStorage.removeItem("id");
    },
  },
});
