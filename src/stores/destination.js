import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import DestinationAPI from "@/api/Combos/DeptAPI.js";

export const useDestinationsStore = defineStore("destinations", () => {
  const destinations = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await DestinationAPI.all();
      destinations.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de destination: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.destinationName.localeCompare(b.destinationName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    destinations,
    loading,
    error,
  };
});
