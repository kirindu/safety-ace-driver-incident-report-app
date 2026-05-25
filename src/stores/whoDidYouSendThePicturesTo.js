import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import WhoDidYouSendThePictureToAPI from "@/api/Combos/WhoDidYouSendThePictureToAPI.js";

export const useWhoDidYouSendThePictureToStore = defineStore("whoDidYouSendThePictureTo", () => {
  const whoDidYouSendThePicturesTo = ref([]);
  const loading = ref(false);
  const error = ref("");

  onMounted(async () => {
    loading.value = true;

    try {
      const { data } = await WhoDidYouSendThePictureToAPI.all();
      whoDidYouSendThePicturesTo.value = data.data.sort(naturalSort);

    } catch (err) {
      error.value = `Ocurrio el siguiente error al intentar llamar al servicio de who did you send the picture to: ${err}`;
    } finally {
      loading.value = false;
    }
  });



  const naturalSort = (a, b) =>{
  return a.whoDidYouSendThePictureToName.localeCompare(b.whoDidYouSendThePictureToName, undefined, { numeric: true, sensitivity: 'base' });
}

  return {
    whoDidYouSendThePicturesTo,
    loading,
    error,
  };
});
