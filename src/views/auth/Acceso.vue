<script setup>
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen">
        <div class="text-center">
            <i class="pi pi-lock text-6xl text-red-500 mb-4"></i>
            <h1 class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-2">Acceso denegado</h1>
            <p class="text-muted-color mb-6">No tienes permiso para ver esta página.</p>
            <Button label="Volver al inicio" icon="pi pi-home" @click="router.push('/')" />
        </div>
    </div>
</template>