import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import SourceAPI from "@/api/Combos/SourceAPI.js";

export const useSourcesStore = defineStore("sources", () => {
  const sources = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await SourceAPI.all();
      sources.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de source: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.sourceName.localeCompare(b.sourceName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    sources,
    loading,
    error,
  };
});
