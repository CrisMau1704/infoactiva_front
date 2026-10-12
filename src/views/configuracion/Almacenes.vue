<script setup>
import { AlmacenService } from '@/service/AlmacenService';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const auth = useAuthStore();

const almacenes = ref([]);
const almacen = ref({});
const almacenDialog = ref(false);
const desactivarDialog = ref(false);
const submitted = ref(false);
const guardando = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const errores = ref({}); // errores de validación que devuelve Laravel (422)

// Regionales para el select del formulario y el filtro
const regionales = ref([]);

const buscar = ref('');
const filtroEstado = ref(null);
const filtroRegional = ref(null);

const lazyParams = ref({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null
});

const estados = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];

// ============================================
// Permisos de pantalla
// ============================================
const puedeCrear = computed(() => auth.tienePermiso('almacenes.crear'));
const puedeEditar = computed(() => auth.tienePermiso('almacenes.editar'));
const puedeDesactivar = computed(() => auth.tienePermiso('almacenes.eliminar'));

const esEdicion = computed(() => !!almacen.value.id_almacen);

// En el formulario se ofrecen las regionales activas, más la actual del almacén
// (por si se desactivó después y aun así debe verse su nombre al editar).
const regionalesDisponibles = computed(() => regionales.value.filter((r) => r.estado === 'activo' || r.id_regional === almacen.value.id_regional));

// ============================================
// Cargar datos
// ============================================
async function cargarAlmacenes() {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            por_pagina: lazyParams.value.rows,
            buscar: buscar.value,
            estado: filtroEstado.value,
            id_regional: filtroRegional.value
        };

        if (lazyParams.value.sortField) {
            params.ordenar_por = lazyParams.value.sortField;
            params.direccion = lazyParams.value.sortOrder === 1 ? 'asc' : 'desc';
        }

        const response = await AlmacenService.getAlmacenes(params);
        almacenes.value = response.data;
        totalRecords.value = response.meta.total;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudieron cargar los almacenes', life: 3000 });
    } finally {
        loading.value = false;
    }
}

async function cargarRegionales() {
    try {
        const response = await AlmacenService.getCatalogos();
        regionales.value = response.data.regionales;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las regionales', life: 3000 });
    }
}

onMounted(() => {
    cargarAlmacenes();
    cargarRegionales();
});

// ============================================
// Búsqueda, filtros, paginación y orden
// ============================================
let busquedaTimer = null;
function onBuscar() {
    clearTimeout(busquedaTimer);
    busquedaTimer = setTimeout(reiniciarYCargar, 400);
}

function reiniciarYCargar() {
    lazyParams.value.page = 1;
    lazyParams.value.first = 0;
    cargarAlmacenes();
}

function onPage(event) {
    lazyParams.value.page = event.page + 1;
    lazyParams.value.rows = event.rows;
    lazyParams.value.first = event.first;
    cargarAlmacenes();
}

function onSort(event) {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    cargarAlmacenes();
}

// ============================================
// Formulario: crear / editar
// ============================================
function openNew() {
    almacen.value = {
        id_regional: null,
        nombre: '',
        direccion: '',
        estado: 'activo'
    };
    submitted.value = false;
    errores.value = {};
    almacenDialog.value = true;
}

function editAlmacen(row) {
    almacen.value = { ...row };
    submitted.value = false;
    errores.value = {};
    almacenDialog.value = true;
}

function hideDialog() {
    almacenDialog.value = false;
    submitted.value = false;
    errores.value = {};
}

// Mensaje bajo cada campo: primero el del frontend, luego el del servidor
function errorCampo(campo, falta = false) {
    if (submitted.value && falta) return 'Este campo es obligatorio';
    return errores.value[campo]?.[0] || '';
}

async function saveAlmacen() {
    submitted.value = true;
    errores.value = {};

    const a = almacen.value;
    if (!a.id_regional || !a.nombre?.trim() || !a.direccion?.trim()) {
        return;
    }

    const payload = {
        id_regional: a.id_regional,
        nombre: a.nombre,
        direccion: a.direccion,
        estado: a.estado
    };

    guardando.value = true;
    try {
        if (esEdicion.value) {
            await AlmacenService.updateAlmacen(a.id_almacen, payload);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Almacén actualizado correctamente', life: 3000 });
        } else {
            await AlmacenService.createAlmacen(payload);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Almacén creado correctamente', life: 3000 });
        }

        hideDialog();
        almacen.value = {};
        cargarAlmacenes();
    } catch (error) {
        if (error.status === 422 && error.errors) {
            errores.value = error.errors;
            toast.add({ severity: 'error', summary: 'Revisa los datos', detail: 'Hay campos con errores', life: 4000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo guardar el almacén', life: 3000 });
        }
    } finally {
        guardando.value = false;
    }
}

// ============================================
// Desactivar
// ============================================
function confirmDesactivar(row) {
    almacen.value = row;
    desactivarDialog.value = true;
}

async function desactivarAlmacen() {
    try {
        await AlmacenService.desactivarAlmacen(almacen.value.id_almacen);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Almacén desactivado correctamente', life: 3000 });
        desactivarDialog.value = false;
        almacen.value = {};
        cargarAlmacenes();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo desactivar el almacén', life: 3000 });
    }
}

function getEstadoSeverity(estado) {
    return estado === 'activo' ? 'success' : 'danger';
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button v-if="puedeCrear" label="Nuevo almacén" icon="pi pi-plus" class="mr-2" @click="openNew" />
            </template>
        </Toolbar>

        <DataTable
            :value="almacenes"
            dataKey="id_almacen"
            lazy
            paginator
            :rows="lazyParams.rows"
            :first="lazyParams.first"
            :totalRecords="totalRecords"
            :loading="loading"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} almacenes"
            @page="onPage"
            @sort="onSort"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Almacenes</h4>
                    <div class="flex flex-wrap gap-2">
                        <Select v-model="filtroRegional" :options="regionales" optionLabel="nombre" optionValue="id_regional" placeholder="Todas las regionales" showClear @change="reiniciarYCargar" />
                        <Select v-model="filtroEstado" :options="estados" optionLabel="label" optionValue="value" placeholder="Todos los estados" showClear @change="reiniciarYCargar" />
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="buscar" placeholder="Buscar por nombre, dirección o regional..." @input="onBuscar" />
                        </IconField>
                    </div>
                </div>
            </template>

            <template #empty>No se encontraron almacenes.</template>

            <Column field="id_almacen" header="ID" sortable style="min-width: 5rem"></Column>
            <Column field="regional" header="Regional" sortable style="min-width: 12rem">
                <template #body="{ data }">{{ data.regional?.nombre ?? '—' }}</template>
            </Column>
            <Column field="nombre" header="Nombre" sortable style="min-width: 14rem"></Column>
            <Column field="direccion" header="Dirección" sortable style="min-width: 16rem"></Column>
            <Column field="estado" header="Estado" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getEstadoSeverity(data.estado)" />
                </template>
            </Column>
            <Column :exportable="false" style="min-width: 9rem">
                <template #body="{ data }">
                    <Button v-if="puedeEditar" icon="pi pi-pencil" outlined rounded class="mr-2" @click="editAlmacen(data)" />
                    <Button v-if="puedeDesactivar && data.estado === 'activo'" icon="pi pi-ban" outlined rounded severity="danger" @click="confirmDesactivar(data)" />
                </template>
            </Column>
        </DataTable>

        <!-- Formulario crear / editar -->
        <Dialog v-model:visible="almacenDialog" :style="{ width: '550px' }" :header="esEdicion ? 'Editar almacén' : 'Nuevo almacén'" modal>
            <div class="flex flex-col gap-4">
                <div>
                    <label for="regional" class="block font-bold mb-2">Regional *</label>
                    <Select
                        id="regional"
                        v-model="almacen.id_regional"
                        :options="regionalesDisponibles"
                        optionLabel="nombre"
                        optionValue="id_regional"
                        placeholder="Seleccione una regional"
                        filter
                        :invalid="!!errorCampo('id_regional', !almacen.id_regional)"
                        fluid
                    />
                    <small v-if="errorCampo('id_regional', !almacen.id_regional)" class="text-red-500">{{ errorCampo('id_regional', !almacen.id_regional) }}</small>
                </div>

                <div>
                    <label for="nombre" class="block font-bold mb-2">Nombre *</label>
                    <InputText id="nombre" v-model.trim="almacen.nombre" autofocus :invalid="!!errorCampo('nombre', !almacen.nombre)" fluid />
                    <small v-if="errorCampo('nombre', !almacen.nombre)" class="text-red-500">{{ errorCampo('nombre', !almacen.nombre) }}</small>
                </div>

                <div>
                    <label for="direccion" class="block font-bold mb-2">Dirección *</label>
                    <InputText id="direccion" v-model.trim="almacen.direccion" :invalid="!!errorCampo('direccion', !almacen.direccion)" fluid />
                    <small v-if="errorCampo('direccion', !almacen.direccion)" class="text-red-500">{{ errorCampo('direccion', !almacen.direccion) }}</small>
                </div>

                <div>
                    <label for="estado" class="block font-bold mb-2">Estado</label>
                    <Select id="estado" v-model="almacen.estado" :options="estados" optionLabel="label" optionValue="value" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" :loading="guardando" @click="saveAlmacen" />
            </template>
        </Dialog>

        <!-- Confirmar desactivación -->
        <Dialog v-model:visible="desactivarDialog" :style="{ width: '450px' }" header="Confirmar" modal>
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="almacen">
                    ¿Desactivar el almacén <b>{{ almacen.nombre }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="desactivarDialog = false" />
                <Button label="Sí, desactivar" icon="pi pi-check" severity="danger" @click="desactivarAlmacen" />
            </template>
        </Dialog>
    </div>
</template>