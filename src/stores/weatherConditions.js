import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import WeatherConditionAPI from "@/api/Combos/WeatherConditionAPI";

export const useWeatherConditionsStore = defineStore("weatherConditions", () => {
  const weatherConditions = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await WeatherConditionAPI.all();
      weatherConditions.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de weather condition: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.weatherName.localeCompare(b.weatherName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    weatherConditions,
    loading,
    error,
  };
});
