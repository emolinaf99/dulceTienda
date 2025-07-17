
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

const app = createApp(App)

// Crear una instancia de Pinia
const pinia = createPinia();

// Usar Pinia y el router en la aplicación
app.use(pinia);
app.use(router);


app.mount('#app')
