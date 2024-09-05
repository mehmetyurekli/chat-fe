import './assets/index.css'
import 'vue-toastification/dist/index.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'

const app = createApp(App)

app.use(createPinia())
app.use(router);
app.use(Toast, {
    maxToasts: 3,
    timeout: 3000,
    newestOnTop: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
});


app.mount('#app')
