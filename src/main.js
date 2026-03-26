

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Vue3Signature from "vue3-signature";
import '@mescius/activereportsjs/styles/ar-js-ui.css'

import { createModal } from '@kolirt/vue-modal'

import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";
import 'vue-select/dist/vue-select.css';


import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(ToastPlugin);
app.use(router)
app.use(Vue3Signature);

// Seleccion de temas, light, dark, auto
dzSettingsOptions.version = 'light';
new dzSettings(dzSettingsOptions);
document.cookie = "version=light"; 

app.use(createModal({
  transitionTime: 200,
  animationType: 'slideDown',
  modalStyle: {
    padding: '5rem 2rem',
    align: 'center',
    'z-index': 201
  },
  overlayStyle: {
    'background-color': 'rgba(0, 0, 0, .5)',
    'backdrop-filter': 'blur(5px)',
    'z-index': 200
  }
}));

app.component('VueDatePicker', VueDatePicker);

app.mount('#app')
