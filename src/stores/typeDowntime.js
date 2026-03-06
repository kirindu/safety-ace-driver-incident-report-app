import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import TypeDowntimeAPI from "@/api/Combos/TypeDowntimeAPI.js";

export const useTypeDownTimeStore = defineStore("typeDownTimes", () => {
  const typeDownTimes = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
     const { data } = await TypeDowntimeAPI.all();
     typeDownTimes.value = data.data.sort(naturalSort);


    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de typeDownTimes: ${err}`;
    } finally {
      loading.value = false;
    }
  });

    const naturalSort = (a, b) =>{
  return a.typeDownTimeName.localeCompare(b.typeDownTimeName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    typeDownTimes,
    loading,
    error,
  };
});
