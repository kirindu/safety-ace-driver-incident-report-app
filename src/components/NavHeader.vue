<script>
export default {
  methods: {
    handleRedirect() {
      const userRaw = localStorage.getItem("USER-SAFETY-ACE");
      if (userRaw) {
        let user;
        try {
          user = JSON.parse(userRaw);
          let role = user?.data?.rol || user?.data?.user?.rol;
          if (role === 'Driver') {
            window.location.href = '/';
          } else {
            window.location.href = '/admin/dashboard';
          }
        } catch (e) {
          console.warn('Error parsing user data:', e);
          window.location.href = '/auth/login';
        }
      } else {
        window.location.href = '/auth/login';
      }
    }
  }
}
</script>

<template>
  <div class="nav-header" @click="handleRedirect">
    <a class="brand-logo">
      <img
        fetchpriority="high"
        decoding="async"
        width="188"
        height="56"
        src="@/assets/logo/acedisposal-logo.png"
      />

      <div class="brand-title-container">
        <span class="brand-title-text">ACE Driver Incident Report</span>
      </div>
    </a>
  </div>
</template>


<style scoped>
.nav-header {
  cursor: pointer;
  background-color: #cdc7e5;
  border: none !important;
  box-shadow: none !important;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-title-container {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.brand-title-text {
  font-size: 18px;
  font-weight: bold;
  color: black;
  white-space: nowrap;
}
</style>