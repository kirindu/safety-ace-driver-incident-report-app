import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import TypeIncidentAPI from "@/api/Combos/TypeIncidentAPI.js";

export const useTypeIncidentsStore = defineStore("typeIncidents", () => {
  const typeIncidents = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await TypeIncidentAPI.all();
    //  typeIncidents.value = data.data; // Recuerda que data es el wrap de axios
      typeIncidents.value = data.data.sort(naturalSort);

      //   console.log(typeIncidents.value);
    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de type incident: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.typeIncidentName.localeCompare(b.typeIncidentName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    typeIncidents,
    loading,
    error,
  };
});
