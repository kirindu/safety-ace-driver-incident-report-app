import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import HomeBaseAPI from "@/api/Combos/WeatherConditionAPI";

export const useHomeBasesStore = defineStore("homebases", () => {
  const homebases = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await HomeBaseAPI.all();
      homebases.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de homebase: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.homeBaseName.localeCompare(b.homeBaseName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    homebases,
    loading,
    error,
  };
});
