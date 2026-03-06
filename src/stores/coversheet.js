import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import CoverSheetAPI from "@/api/Sections/GeneralInformationAPI.js";

export const useCoverSheetStore = defineStore("coversheets", () => {
  const coversheets = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await CoverSheetAPI.all();
      coversheets.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(coversheets.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de coversheet: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    coversheets,
    loading,
    error,
  };
});
