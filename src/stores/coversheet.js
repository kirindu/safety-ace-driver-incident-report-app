import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import GeneralInformationAPI from "@/api/Sections/GeneralInformationAPI.js";

export const useGeneralInformationStore = defineStore("generalinformations", () => {
  const generalinformations = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await GeneralInformationAPI.all();
      generalinformations.value = data.data; // Recuerda que data es el wrap de axios

      //   console.log(generalinformations.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de generalinformation: ${err}`;
    } finally {
      loading.value = false;
    }
  });

  return {
    generalinformations,
    loading,
    error,
  };
});
