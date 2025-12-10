<script setup>
import { RouterView } from 'vue-router'
import Preloader from '@/components/Preloader.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div id="app">
    <Preloader />
    
    <main class="main-content">
      <RouterView />
    </main>
    
    <Footer />
  </div>
</template>

<style>
/* Estilos globales para el layout con sticky footer */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Altura mínima igual al viewport */
}

.main-content {
  flex: 1; /* Ocupa todo el espacio disponible, empujando el footer hacia abajo */
}
</style>