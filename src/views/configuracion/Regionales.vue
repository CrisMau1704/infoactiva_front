<script setup>
import { RegionalService } from '@/service/RegionalService';
import { useAuthStore } from '@/stores/auth';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const auth = useAuthStore(); 

const dt = ref();
const regionales = ref([]);
const regional = ref({});
const regionalDialog = ref(false);
const deleteRegionalDialog = ref(false);
const submitted = ref(false);
const loading = ref(false);
const totalRecords = ref(0);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Estado para la tabla
const lazyParams = ref({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    buscar: null,
    estado: null,
});

// Estados disponibles
const estados = ref([
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
]);

// ============================================
// Cargar datos
// ============================================
async function cargarRegionales() {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            por_pagina: lazyParams.value.rows,
        };

        if (lazyParams.value.buscar) params.buscar = lazyParams.value.buscar;
        if (lazyParams.value.estado) params.estado = lazyParams.value.estado;
        if (lazyParams.value.sortField) {
            params.ordenar_por = lazyParams.value.sortField;
            params.direccion = lazyParams.value.sortOrder === 1 ? 'asc' : 'desc';
        }

        const response = await RegionalService.getRegionales(params);
        regionales.value = response.data;
        totalRecords.value = response.meta.total;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudieron cargar los regionales',
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    cargarRegionales();
});

// ============================================
// Búsqueda global (debounce manual)
// ============================================
let busquedaTimer = null;
function onBuscarGlobal() {
    clearTimeout(busquedaTimer);
    busquedaTimer = setTimeout(() => {
        lazyParams.value.buscar = filters.value.global.value;
        lazyParams.value.page = 1;
        lazyParams.value.first = 0;
        cargarRegionales();
    }, 400);
}

// ============================================
// Paginación y ordenamiento
// ============================================
function onPage(event) {
    lazyParams.value.page = event.page + 1;
    lazyParams.value.rows = event.rows;
    lazyParams.value.first = event.first;
    cargarRegionales();
}

function onSort(event) {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    cargarRegionales();
}

// ============================================
// CRUD: Crear / Editar
// ============================================
function openNew() {
    regional.value = {
        nombre: '',
        ciudad: '',
        direccion: '',
        telefono: '',
        email: '',
        estado: 'activo',
    };
    submitted.value = false;
    regionalDialog.value = true;
}

function editRegional(row) {
    regional.value = { ...row };
    regionalDialog.value = true;
}

function hideDialog() {
    regionalDialog.value = false;
    submitted.value = false;
}

async function saveRegional() {
    submitted.value = true;

   
    if (!regional.value.nombre?.trim() || !regional.value.ciudad?.trim()) {
        return;
    }

    try {
        if (regional.value.id_regional) {
            // Actualizar
            const response = await RegionalService.updateRegional(regional.value.id_regional, {
                nombre: regional.value.nombre,
                ciudad: regional.value.ciudad,
                direccion: regional.value.direccion,
                telefono: regional.value.telefono,
                email: regional.value.email,
                estado: regional.value.estado,
            });

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Regional actualizado correctamente',
                life: 3000,
            });
        } else {
            // Crear
            const response = await RegionalService.createRegional({
                nombre: regional.value.nombre,
                ciudad: regional.value.ciudad,
                direccion: regional.value.direccion,
                telefono: regional.value.telefono,
                email: regional.value.email,
                estado: regional.value.estado,
            });

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Regional creado correctamente',
                life: 3000,
            });
        }

        regionalDialog.value = false;
        regional.value = {};
        cargarRegionales();
    } catch (error) {
       
        if (error.status === 422 && error.errors) {
            const mensajes = Object.values(error.errors).flat().join(', ');
            toast.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: mensajes,
                life: 5000,
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'No se pudo guardar la regional',
                life: 3000,
            });
        }
    }
}

// ============================================
// CRUD: Eliminar
// ============================================
function confirmDeleteRegional(row) {
    regional.value = row;
    deleteRegionalDialog.value = true;
}

async function deleteRegional() {
    try {
        await RegionalService.deleteRegional(regional.value.id_regional);

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Regional eliminado correctamente',
            life: 3000,
        });

        deleteRegionalDialog.value = false;
        regional.value = {};
        cargarRegionales();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo eliminar la regional',
            life: 3000,
        });
    }
}

// ============================================
// Helpers
// ============================================
function getEstadoSeverity(estado) {
    return estado === 'activo' ? 'success' : 'danger';
}

function puedeCrear() {
    return auth.permisos?.includes('regionales.crear');
}
function puedeEditar() {
    return auth.permisos?.includes('regionales.editar');
}
function puedeEliminar() {
    return auth.permisos?.includes('regionales.eliminar');
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button
                    v-if="puedeCrear()"
                    label="Nuevo Regional"
                    icon="pi pi-plus"
                    severity="primary"
                    class="mr-2"
                    @click="openNew"
                />
            </template>

            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="dt.exportCSV()" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="regionales"
            dataKey="id_regional"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :lazy="true"
            :loading="loading"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} regionales"
            @page="onPage"
            @sort="onSort"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Lista de Regionales</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText
                            v-model="filters['global'].value"
                            placeholder="Buscar por ciudad..."
                            @input="onBuscarGlobal"
                        />
                    </IconField>
                </div>
            </template>

            <Column field="id_regional" header="ID" sortable style="min-width: 6rem"></Column>
            <Column field="nombre" header="Nombre" sortable style="min-width: 18rem"></Column>
            <Column field="ciudad" header="Ciudad" sortable style="min-width: 10rem"></Column>
            <Column field="direccion" header="Dirección" sortable style="min-width: 16rem"></Column>
            <Column field="telefono" header="Teléfono" sortable style="min-width: 10rem"></Column>
            <Column field="email" header="Correo" sortable style="min-width: 16rem"></Column>
            <Column field="estado" header="Estado" sortable style="min-width: 8rem">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" />
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 10rem">
                <template #body="slotProps">
                    <Button
                        v-if="puedeEditar()"
                        icon="pi pi-pencil"
                        outlined
                        rounded
                        class="mr-2"
                        @click="editRegional(slotProps.data)"
                    />
                    <Button
                        v-if="puedeEliminar()"
                        icon="pi pi-trash"
                        outlined
                        rounded
                        severity="danger"
                        @click="confirmDeleteRegional(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>

        <!-- Dialog Crear/Editar -->
        <Dialog
            v-model:visible="regionalDialog"
            :style="{ width: '550px' }"
            :header="regional.id_regional ? 'Editar Regional' : 'Nueva Regional'"
            :modal="true"
        >
            <div class="flex flex-col gap-4">
                <div>
                    <label for="nombre" class="block font-bold mb-2">Nombre *</label>
                    <InputText
                        id="nombre"
                        v-model.trim="regional.nombre"
                        required
                        autofocus
                        :invalid="submitted && !regional.nombre"
                        fluid
                    />
                    <small v-if="submitted && !regional.nombre" class="text-red-500">El nombre es obligatorio</small>
                </div>

                <div>
                    <label for="nit" class="block font-bold mb-2">Ciudad *</label>
                    <InputText
                        id="nit"
                        v-model.trim="regional.ciudad"
                        required
                        :invalid="submitted && !regional.ciudad"
                        fluid
                    />
                    <small v-if="submitted && !regional.ciudad" class="text-red-500">El ciudad es obligatorio</small>
                </div>

                 <div>
                    <label for="direccion" class="block font-bold mb-2">Dirección</label>
                    <InputText id="direccion" v-model.trim="regional.direccion" fluid />
                </div>

                 <div>
                    <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                    <InputText id="telefono" v-model.trim="regional.telefono" fluid />
                </div>

                <div>
                    <label for="email" class="block font-bold mb-2">Correo electrónico</label>
                    <InputText id="email" v-model.trim="regional.email" type="email" fluid />
                </div>
               

                <div>
                    <label for="estado" class="block font-bold mb-2">Estado</label>
                    <Select
                        id="estado"
                        v-model="regional.estado"
                        :options="estados"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccione un estado"
                        fluid
                    />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveRegional" />
            </template>
        </Dialog>

        <!-- Dialog Confirmar Eliminar -->
        <Dialog
            v-model:visible="deleteRegionalDialog"
            :style="{ width: '450px' }"
            header="Confirmar"
            :modal="true"
        >
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="regional">
                    ¿Está seguro de eliminar la regional <b>{{ regional.nombre }}</b>?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteRegionalDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="deleteRegional" />
            </template>
        </Dialog>
    </div>
</template>