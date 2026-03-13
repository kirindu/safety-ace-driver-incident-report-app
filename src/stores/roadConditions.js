import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import RoadConditionAPI from "@/api/Combos/RoadConditionAPI.js";

export const useRoadConditionsStore = defineStore("roadConditions", () => {
  const roadConditions = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await RoadConditionAPI.all();
      roadConditions.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de road condition: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.roadConditionName.localeCompare(b.roadConditionName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    roadConditions,
    loading,
    error,
  };
});
