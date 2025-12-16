<template>
  <div class="dashboard-container">
    <iframe
      :src="metabaseUrl"
      width="100%"
      height="900"
      frameborder="0"
      allowtransparency
    ></iframe>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// URLs de los diferentes reportes
const reportUrls = {
  'single-date': 'https://metabase.kizunadata.cloud/public/question/3536d878-1db6-417b-87db-bec31bc2134a',
  'date-range': 'https://metabase.kizunadata.cloud/public/question/4c82025d-1c24-4ccc-a4c7-113fd210275c',
  'driver-name': 'https://metabase.kizunadata.cloud/public/question/ba704ea3-9c18-4aeb-97d5-1204623c69e8',
  'load-single-date': 'https://metabase.kizunadata.cloud/public/question/55cdb9b8-5401-41ec-8e21-e60f42a9ab80',
  'load-date-range': 'https://metabase.kizunadata.cloud/public/question/da3028c5-dabb-4766-aaea-6f5748333723'
}

// Computed property que determina qué URL usar basado en el parámetro de la ruta
const metabaseUrl = computed(() => {
  const reportType = route.params.type || 'single-date'
  return reportUrls[reportType] || reportUrls['single-date']
})
</script>

<style scoped>
.dashboard-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px;
  margin-top: 80px;
}
</style>driver_info