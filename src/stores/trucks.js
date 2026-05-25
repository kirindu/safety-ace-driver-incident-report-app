import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import TruckAPI from "@/api/Combos/TruckAPI.js";

export const useTrucksStore = defineStore("trucks", () => {
  const trucks = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await TruckAPI.all();
     // trucks.value = data.data; // Recuerda que data es el wrap de axios
     trucks.value = data.data.sort((a, b) => Number(a.truckNumber) - Number(b.truckNumber));

      //   console.log(trucks.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de truck: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    trucks,
    loading,
    error,
  };
});
