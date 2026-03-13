import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import DeptAPI from "@/api/Combos/DeptAPI.js";

export const useDeptsStore = defineStore("depts", () => {
  const depts = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await DeptAPI.all();
      depts.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de dept: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.deptName.localeCompare(b.deptName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    depts,
    loading,
    error,
  };
});
