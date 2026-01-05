import Swal from 'sweetalert2';
import { ref } from 'vue';

export default function useSweetAlert2Notification() {
  const alertResult = ref(null);

  const showSweetAlert = async (options) => {
    try {
      const result = await Swal.fire(options);
      alertResult.value = result;
      return result; // ✅ ESTO FALTABA - Retornar el resultado
    } catch (error) {
      console.error('SweetAlert2 error:', error);
      return null; // ✅ Retornar null en caso de error
    }
  };

  return {
    showSweetAlert,
    alertResult
  };
}






