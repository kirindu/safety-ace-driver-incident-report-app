import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import LandFillAPI from "@/api/Combos/DirectionAPI";

export const useLandFillsStore = defineStore("landfills", () => {
  const landfills = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await LandFillAPI.all();
      landfills.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(routes.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de landfill: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    landfills,
    loading,
    error,
  };
});
