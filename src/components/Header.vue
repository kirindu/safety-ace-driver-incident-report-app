<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

console.log('🟢 Header: Iniciando carga del componente');

const links_disabled = ref(false)
const router = useRouter()

// Variables locales (sin useAuth por ahora)
const user = ref(null)

// Inicializar usuario desde localStorage directamente
onMounted(() => {
  console.log('🟢 Header: onMounted ejecutado');
  const storedUser = localStorage.getItem("USER-SAFETY-ACE");
  
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      console.log('🟢 Header: Usuario parseado:', parsed);
      
      if (parsed.data?.user) {
        user.value = parsed.data.user; // ADMIN
      } else if (parsed.data) {
        user.value = parsed.data; // DRIVER
      }
      
      console.log('🟢 Header: Usuario asignado:', user.value);
    } catch (e) {
      console.error('🔴 Header: Error al parsear USER:', e);
    }
  } else {
    console.log('⚠️ Header: No hay usuario en localStorage');
  }
});

const avatarSrc = computed(() => {
  if (!user.value) return '/assets/images/avatar/avatar_driver.jpg';
  
  return user.value.rol === 'Admin' 
    ? '/assets/images/avatar/avatar_admin.png'
    : '/assets/images/avatar/avatar_driver.jpg';
});

const isAdmin = computed(() => {
  return user.value?.rol === 'Admin';
});

const menu_visible = computed(() => {
  const visible = isAdmin.value;
  console.log('🟢 Header: menu_visible:', visible);
  return visible;
});

// Fecha actual formateada
const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
)

// Método para manejar el logout
const logout = () => {
  user.value = null;
  localStorage.removeItem("USER-SAFETY-ACE");
  localStorage.removeItem("ACE-INCIDENT-REPORT");
  localStorage.removeItem("ACE-INCIDENT-REPORT2");
  router.push({ name: 'login' });
}

console.log('🟢 Header: Componente cargado completamente');
</script>

<template>
  <div class="header" style="background-color:#cdc7e5;">
    <div class="header-content">
      <nav class="navbar navbar-expand">
        <div class="collapse navbar-collapse justify-content-between">

<!-- 
    <div v-show="menu_visible" class="header-left">

      <nav class="main-menu">
         <a @click.prevent="router.push({ name: 'admin-drivers' })" class="menu-item">Employees</a> 
         <a @click.prevent="router.push({ name: 'admin-users' })" class="menu-item">Users</a> 
        <a :class="{'disabled-link': links_disabled}" @click.prevent="links_disabled ? null : router.push({ name: 'admin-trailers' })" class="menu-item">Type of Incidents</a>
        <a :class="{'disabled-link': links_disabled}" @click.prevent="links_disabled ? null : router.push({ name: 'admin-trucks' })" class="menu-item">Trucks</a>

        <div class="dropdown-container">
          <span :class="{'disabled-link': links_disabled}" class="menu-item dropdown-label">
            Reports
            <i class="fas fa-caret-down"></i>
          </span>

<div class="dropdown-menu reports-menu"> 
    <a @click.prevent="links_disabled ? null : router.push({ name: 'admin-reports', params: { type: 'date-range' } })">CoverSheet Report</a>
    <a @click.prevent="links_disabled ? null : router.push({ name: 'admin-reports', params: { type: 'load-date-range' } })">Load Report</a>
    <a @click.prevent="links_disabled ? null : router.push({ name: 'admin-reports', params: { type: 'downtime-date-range' } })">DownTime Report</a>
  </div>

        </div>
      </nav>


    </div> -->


          <ul class="navbar-nav header-right" style="display: flex; width: 100%;">

          <!-- Fecha actual -->
            <li class="nav-item" style="margin-left: auto; margin-right: 8px;">
              <div class="current-date-display">
                <i class="far fa-calendar-alt me-2"></i>
                <span class="date-text">{{ currentDate }}</span>
              </div>
            </li>
<!-- Fin Fecha actual -->

            <li class="nav-item">
              <a
                class="nav-link user-profile-link"
                href="javascript:void(0);"
                role="button"
                data-bs-toggle="dropdown"
              >
                <div class="user-profile-container">
                  <img :src="avatarSrc" width="40" height="40" class="user-avatar" alt="User Avatar" />
                  <div class="header-info">
                    <span class="user-name">{{ user?.name || 'Usuario desconocido' }}</span>
                    <small class="user-role">{{ user?.rol || 'Rol no definido' }}</small>
                  </div>
                  <svg
                    class="dropdown-arrow"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.2803 2.8447L5.99998 7.56435L10.7197 2.8447C10.8606 2.70545 11.0509 2.62764 11.249 2.62824C11.4472 2.62884 11.637 2.70781 11.7771 2.8479C11.9172 2.988 11.9962 3.17784 11.9968 3.37596C11.9974 3.57408 11.9195 3.76439 11.7803 3.90534L6.5303 9.15534C6.38965 9.29599 6.19889 9.375 5.99998 9.375C5.80108 9.375 5.61031 9.29599 5.46966 9.15534L0.219662 3.90534C0.0804205 3.76439 0.00260448 3.57408 0.0032053 3.37596C0.00380707 3.17784 0.082778 2.988 0.222872 2.8479C0.362967 2.70781 0.552803 2.62884 0.750925 2.62824C0.949048 2.62764 1.13936 2.70545 1.2803 2.8447Z"
                      fill="#6B7280"
                    />
                  </svg>
                </div>
              </a>
              <div class="dropdown-menu dropdown-menu-end modern-dropdown">
                <div class="dropdown-header">
                  <img :src="avatarSrc" width="50" height="50" class="dropdown-avatar" alt="User Avatar" />
                  <div class="dropdown-user-info">
                    <span class="dropdown-user-name">{{ user?.name || 'Usuario desconocido' }}</span>
                    <small class="dropdown-user-role">{{ user?.rol || 'Rol no definido' }}</small>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" @click.prevent="logout" class="dropdown-item logout-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </a>
              </div>
            </li>





          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.header {
  background-color: #cdc7e5;
  border-left: none !important;
  border-right: none !important;
}

/* User Profile Styles */
.user-profile-link {
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.user-profile-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-profile-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.dropdown-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.dropdown.show .dropdown-arrow {
  transform: rotate(180deg);
}

/* Modern Dropdown Styles */
.modern-dropdown {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0;
  min-width: 250px;
  margin-top: 12px;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dropdown-avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
}

.dropdown-user-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.dropdown-user-role {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.dropdown-divider {
  margin: 0;
  border-top: 1px solid #e5e7eb;
}

.logout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: #dc2626;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.logout-item:hover {
  background-color: #e8abab;
  color: #b91c1c;
}

.logout-item svg {
  flex-shrink: 0;
}

/* Date Display Styles */
.current-date-display {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 8px 20px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.current-date-display i {
  color: #ffffff;
  font-size: 18px;
}

.date-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Contenedor principal */
.header-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #d8d4ec;
  padding: 10px 20px;
}

/* Izquierda */
.left-container {
  display: flex;
  align-items: center;
}

.ace-logo {
  height: 55px;
  margin-right: 20px;
}

/* === MENÚ ARREGLADO === */
.main-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-item {
  font-size: 13px;
  font-weight: 500;
  color: #28a2eb;
  padding-right: 18px;
  border-right: 2px solid #28a2eb;
  cursor: pointer;
}

.menu-item:last-child {
  border-right: none;
}

/* Dropdown - SOLUCIÓN */
.dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown-label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.reports-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: none; /* 🔑 Esta regla oculta el menú por defecto */
  flex-direction: column;
  min-width: 180px;
  padding: 8px 0;
  z-index: 1000;
  margin-top: 0;
}

/* IMPORTANTE: Mantenemos el hover SOLAMENTE para el menú de Reports */
.dropdown-container:hover .reports-menu,
.reports-menu:hover {
  display: flex; /* 🔑 Esta regla lo muestra al hacer hover */
}

.reports-menu a { /* 💡 También usamos el nuevo selector aquí */
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  transition: background 0.2s ease;
}

.reports-menu a:hover { /* 💡 Y aquí */
  background: #f0f0f0;
  color: #28a2eb;
}

.dropdown-menu a {
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  transition: background 0.2s ease;
}

.dropdown-menu a:hover {
  background: #f0f0f0;
  color: #28a2eb;
}

/* Derecha */
.right-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-date-display {
  background: #6d51e8;
  padding: 10px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-date-display i {
  color: #fff;
}

.date-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.user-name {
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  opacity: 0.7;
}

/* --- Nuevos Estilos para Deshabilitar Links --- */
.disabled-link {
    color: #a0a0a0 !important; /* Color gris suave */
    cursor: not-allowed !important; /* Muestra el cursor de prohibido */
    opacity: 0.7; /* Baja un poco la opacidad */
}

/* Opcional: Deshabilitar visualmente el separador para los deshabilitados */
.menu-item.disabled-link {
    border-right-color: #a0a0a0 !important;
}

/* Opcional: Asegurar que el menú Reports no se abra con hover si está deshabilitado */
.dropdown-container:has(.disabled-link):hover .reports-menu {
    display: none !important;
}
</style>