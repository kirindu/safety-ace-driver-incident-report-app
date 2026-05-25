import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import DirectionAPI from "@/api/Combos/DirectionAPI";

export const useDirectionsStore = defineStore("directions", () => {
  const directions = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await DirectionAPI.all();
      directions.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(routes.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de direction: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    directions,
    loading,
    error,
  };
});
