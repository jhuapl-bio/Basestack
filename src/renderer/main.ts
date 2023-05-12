

import { createApp, inject } from 'vue'
import './assets/css/style.css';
import App from './App.vue'

import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from "vuetify/lib/iconsets/mdi";
// make sure to also import the coresponding css
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components, 
    directives,
    theme: {
        defaultTheme: 'light'
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    },
}) 
let app = createApp(App)

app.use(vuetify).mount('#app')