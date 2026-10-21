
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

// ====================================
// TEMA CORPORATIVO INFOACTIVA
// ====================================

const InfoactivaPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#FFF4EF',
            100: '#FFE4D6',
            200: '#FFC5A8',
            300: '#F99A70',
            400: '#EA7043',
            500: '#D84E1F',
            600: '#BF4018',
            700: '#9D3416',
            800: '#7D2B16',
            900: '#602416',
            950: '#39140D'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                }
            },
            dark: {
                primary: {
                    color: '{primary.400}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}'
                }
            }
        }
    }
});

// ====================================
// INICIALIZAR VUE
// ====================================

const app = createApp(App);

app.use(createPinia());
app.use(router);

// PRIMEVUE CON COLORES INFOACTIVA
app.use(PrimeVue, {
    theme: {
        preset: InfoactivaPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});

app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
