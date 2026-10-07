<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const submitted = ref(false);

async function handleLogin() {
    submitted.value = true;

    if (!email.value || !password.value) {
        toast.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Por favor, ingrese su correo y contraseña',
            life: 3000,
        });
        return;
    }

    loading.value = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Credenciales incorrectas');
        }

        auth.setAuth(data.user, data.access_token, data.user.permisos);

        toast.add({
            severity: 'success',
            summary: 'Bienvenido',
            detail: `Hola, ${data.user.nombre}`,
            life: 3000,
        });

        router.push('/');
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error al iniciar sesión',
            detail: error.message || 'No se pudo conectar con el servidor',
            life: 5000,
        });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <Toast />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Infoactiva</div>
                        <span class="text-muted-color font-medium">Inicie sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                            Correo electrónico
                        </label>
                        <InputText
                            id="email1"
                            type="email"
                            placeholder="admin@infoactiva.com"
                            class="w-full md:w-[30rem] mb-8"
                            v-model="email"
                            :invalid="submitted && !email"
                            @keyup.enter="handleLogin"
                        />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">
                            Contraseña
                        </label>
                        <Password
                            id="password1"
                            v-model="password"
                            placeholder="Contraseña"
                            :toggleMask="true"
                            class="mb-8"
                            fluid
                            :feedback="false"
                            :invalid="submitted && !password"
                            @keyup.enter="handleLogin"
                        />

                        <Button
                            label="Iniciar sesión"
                            icon="pi pi-sign-in"
                            class="w-full"
                            :loading="loading"
                            @click="handleLogin"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <router-view />
</template>