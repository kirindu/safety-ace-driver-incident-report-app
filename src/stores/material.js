import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import MaterialAPI from "@/api/Combos/RoadConditionAPI.js";

export const useMaterialsStore = defineStore("materials", () => {
  const materials = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await MaterialAPI.all();
      materials.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de material: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.materialName.localeCompare(b.materialName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    materials,
    loading,
    error,
  };
});
