import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import OperatorAPI from "@/api/Combos/OperatorAPI.js";

export const useOperatorsStore = defineStore("operators", () => {
  const operators = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await OperatorAPI.all();
      operators.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de operator: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.operatorName.localeCompare(b.operatorName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    operators,
    loading,
    error,
  };
});
