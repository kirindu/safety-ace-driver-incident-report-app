import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import EmployeeAPI from "@/api/Actors/EmployeeAPI.js";

export const useEmployeesStore = defineStore("employees", () => {
  const employees = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await EmployeeAPI.all();
      employees.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(employees.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de employee: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    employees,
    loading,
    error,
  };
});
