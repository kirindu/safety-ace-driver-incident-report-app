import { ref, computed } from 'vue';

// Estado global reactivo (singleton)
const currentUser = ref(null);
const isLoading = ref(true);

export function useAuth() {
  
  /**
   * Inicializa el usuario desde localStorage
   */
  const initUser = () => {
    isLoading.value = true;
    const storedUser = localStorage.getItem('USER');
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        
        // Determinar la estructura correcta
        if (parsed.data?.user) {
          // Estructura de Admin
          currentUser.value = parsed.data.user;
        } else if (parsed.data) {
          // Estructura de Driver
          currentUser.value = parsed.data;
        }
      } catch (e) {
        console.error('Error al parsear USER desde localStorage:', e);
        currentUser.value = null;
      }
    } else {
      currentUser.value = null;
    }
    
    isLoading.value = false;
  };

  /**
   * Actualiza el usuario (por ejemplo, después del login)
   */
  const setUser = (userData) => {
    if (userData?.data?.user) {
      currentUser.value = userData.data.user;
    } else if (userData?.data) {
      currentUser.value = userData.data;
    } else {
      currentUser.value = userData;
    }
  };

  /**
   * Limpia el usuario (logout)
   */
  const clearUser = () => {
    currentUser.value = null;
    localStorage.removeItem('USER');
    localStorage.removeItem("ACE-INCIDENT-REPORT");
  };

  /**
   * Computed para el avatar del usuario
   */
  const avatarSrc = computed(() => {
    if (!currentUser.value) return '/assets/images/avatar/avatar_driver.jpg';
    
    return currentUser.value.rol === 'Admin' 
      ? '/assets/images/avatar/avatar_admin.png'
      : '/assets/images/avatar/avatar_driver.jpg';
  });

  /**
   * Computed para verificar si el usuario es Admin
   */
  const isAdmin = computed(() => {
    return currentUser.value?.rol === 'Admin';
  });

  /**
   * Computed para verificar si el usuario es Driver
   */
  const isDriver = computed(() => {
    return currentUser.value?.rol === 'Driver';
  });

  return {
    // State
    user: computed(() => currentUser.value),
    isLoading: computed(() => isLoading.value),
    
    // Computed
    avatarSrc,
    isAdmin,
    isDriver,
    
    // Methods
    initUser,
    setUser,
    clearUser
  };
}