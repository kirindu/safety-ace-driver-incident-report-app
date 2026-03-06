import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import DriverAPI from "@/api/Actors/EmployeeAPI.js";

export const useDriversStore = defineStore("drivers", () => {
  const drivers = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await DriverAPI.all();
      drivers.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(drivers.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de driver: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    drivers,
    loading,
    error,
  };
});
