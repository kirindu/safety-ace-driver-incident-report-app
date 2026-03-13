import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import SupervisorAPI from "@/api/Combos/SupervisorAPI.js";

export const useSupervisorsStore = defineStore("supervisor", () => {
  const supervisors = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await SupervisorAPI.all();
      supervisors.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de supervisor notified: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.supervisorName.localeCompare(b.supervisorName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    supervisors,
    loading,
    error,
  };
});
