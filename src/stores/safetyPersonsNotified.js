import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import SafetyPersonNotifiedAPI from "@/api/Combos/SafetyPersonNotifiedAPI.js";

export const useSafetyPersonsNotifiedStore = defineStore("safetyPersonNotified", () => {
  const safetyPersonsNotified = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await SafetyPersonNotifiedAPI.all();
      safetyPersonsNotified.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de safety person notified: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.safetyPersonNotifiedName.localeCompare(b.safetyPersonNotifiedName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    safetyPersonsNotified,
    loading,
    error,
  };
});
