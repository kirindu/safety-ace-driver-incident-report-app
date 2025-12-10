<!-- Footer.vue -->
<template>
  <div class="footer">
    <div class="copyright">
      <p>Copyright © Designed &amp; Developed by <a href="https://www.acedisposal.com/" target="_blank">ACE DISPOSAL</a> <span class="current-year">2025</span></p>
    </div>
  </div>
</template>

<style scoped>
.footer {
  background-color: #2c3e50; /* Color de fondo oscuro */
  padding: 20px 0;
  text-align: center;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin-top: 40px; /* Espacio superior para separación del contenido */
}

.copyright {
  margin: 0;
}

.copyright p {
  margin: 0;
  color: #ecf0f1;
  font-size: 14px;
}

.copyright a {
  color: #6f42c1;
  text-decoration: none;
  font-weight: 600;
}

.copyright a:hover {
  text-decoration: underline;
  color: #9b7dd4;
}

.current-year {
  font-weight: 500;
}
</style>