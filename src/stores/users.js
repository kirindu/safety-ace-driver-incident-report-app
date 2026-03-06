import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import UserAPI from "@/api/Actors/UserAPI.js";

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await UserAPI.all();
      users.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(users.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de user: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    users,
    loading,
    error,
  };
});
