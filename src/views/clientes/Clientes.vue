<script setup>
import { ClienteService } from '@/service/ClienteService';
import { useAuthStore } from '@/stores/auth'; // Ajusta si usas otro store
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const auth = useAuthStore(); // Para verificar permisos

const dt = ref();
const clientes = ref([]);
const cliente = ref({});
const clienteDialog = ref(false);
const deleteClienteDialog = ref(false);
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
async function cargarClientes() {
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

        const response = await ClienteService.getClientes(params);
        clientes.value = response.data;
        totalRecords.value = response.meta.total;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudieron cargar los clientes',
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    cargarClientes();
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
        cargarClientes();
    }, 400);
}

// ============================================
// Paginación y ordenamiento
// ============================================
function onPage(event) {
    lazyParams.value.page = event.page + 1;
    lazyParams.value.rows = event.rows;
    lazyParams.value.first = event.first;
    cargarClientes();
}

function onSort(event) {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    cargarClientes();
}

// ============================================
// CRUD: Crear / Editar
// ============================================
function openNew() {
    cliente.value = {
        nombre: '',
        nit: '',
        email: '',
        telefono: '',
        direccion: '',
        estado: 'activo',
    };
    submitted.value = false;
    clienteDialog.value = true;
}

function editCliente(row) {
    cliente.value = { ...row };
    clienteDialog.value = true;
}

function hideDialog() {
    clienteDialog.value = false;
    submitted.value = false;
}

async function saveCliente() {
    submitted.value = true;

    // Validación básica frontend
    if (!cliente.value.nombre?.trim() || !cliente.value.nit?.trim()) {
        return;
    }

    try {
        if (cliente.value.id_cliente) {
            // Actualizar
            const response = await ClienteService.updateCliente(cliente.value.id_cliente, {
                nombre: cliente.value.nombre,
                nit: cliente.value.nit,
                email: cliente.value.email,
                telefono: cliente.value.telefono,
                direccion: cliente.value.direccion,
                estado: cliente.value.estado,
            });

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cliente actualizado correctamente',
                life: 3000,
            });
        } else {
            // Crear
            const response = await ClienteService.createCliente({
                nombre: cliente.value.nombre,
                nit: cliente.value.nit,
                email: cliente.value.email,
                telefono: cliente.value.telefono,
                direccion: cliente.value.direccion,
                estado: cliente.value.estado,
            });

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cliente creado correctamente',
                life: 3000,
            });
        }

        clienteDialog.value = false;
        cliente.value = {};
        cargarClientes();
    } catch (error) {
        // Manejo de errores de validación (422)
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
                detail: error.message || 'No se pudo guardar el cliente',
                life: 3000,
            });
        }
    }
}

// ============================================
// CRUD: Eliminar
// ============================================
function confirmDeleteCliente(row) {
    cliente.value = row;
    deleteClienteDialog.value = true;
}

async function deleteCliente() {
    try {
        await ClienteService.deleteCliente(cliente.value.id_cliente);

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente eliminado correctamente',
            life: 3000,
        });

        deleteClienteDialog.value = false;
        cliente.value = {};
        cargarClientes();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo eliminar el cliente',
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
    return auth.permisos?.includes('clientes.crear');
}
function puedeEditar() {
    return auth.permisos?.includes('clientes.editar');
}
function puedeEliminar() {
    return auth.permisos?.includes('clientes.eliminar');
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button
                    v-if="puedeCrear()"
                    label="Nuevo Cliente"
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
            :value="clientes"
            dataKey="id_cliente"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :lazy="true"
            :loading="loading"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
            @page="onPage"
            @sort="onSort"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Lista de Clientes</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText
                            v-model="filters['global'].value"
                            placeholder="Buscar por nombre o NIT..."
                            @input="onBuscarGlobal"
                        />
                    </IconField>
                </div>
            </template>

            <Column field="id_cliente" header="ID" sortable style="min-width: 6rem"></Column>
            <Column field="nombre" header="Cliente" sortable style="min-width: 18rem"></Column>
            <Column field="nit" header="NIT" sortable style="min-width: 10rem"></Column>
            <Column field="email" header="Correo" sortable style="min-width: 16rem"></Column>
            <Column field="telefono" header="Teléfono" sortable style="min-width: 10rem"></Column>
            <Column field="direccion" header="Dirección" sortable style="min-width: 16rem"></Column>
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
                        @click="editCliente(slotProps.data)"
                    />
                    <Button
                        v-if="puedeEliminar()"
                        icon="pi pi-trash"
                        outlined
                        rounded
                        severity="danger"
                        @click="confirmDeleteCliente(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>

        <!-- Dialog Crear/Editar -->
        <Dialog
            v-model:visible="clienteDialog"
            :style="{ width: '550px' }"
            :header="cliente.id_cliente ? 'Editar Cliente' : 'Nuevo Cliente'"
            :modal="true"
        >
            <div class="flex flex-col gap-4">
                <div>
                    <label for="nombre" class="block font-bold mb-2">Cliente *</label>
                    <InputText
                        id="nombre"
                        v-model.trim="cliente.nombre"
                        required
                        autofocus
                        :invalid="submitted && !cliente.nombre"
                        fluid
                    />
                    <small v-if="submitted && !cliente.nombre" class="text-red-500">El nombre es obligatorio</small>
                </div>

                <div>
                    <label for="nit" class="block font-bold mb-2">NIT *</label>
                    <InputText
                        id="nit"
                        v-model.trim="cliente.nit"
                        required
                        :invalid="submitted && !cliente.nit"
                        fluid
                    />
                    <small v-if="submitted && !cliente.nit" class="text-red-500">El NIT es obligatorio</small>
                </div>

                <div>
                    <label for="email" class="block font-bold mb-2">Correo electrónico</label>
                    <InputText id="email" v-model.trim="cliente.email" type="email" fluid />
                </div>

                <div>
                    <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                    <InputText id="telefono" v-model.trim="cliente.telefono" fluid />
                </div>

                <div>
                    <label for="direccion" class="block font-bold mb-2">Dirección</label>
                    <InputText id="direccion" v-model.trim="cliente.direccion" fluid />
                </div>

                <div>
                    <label for="estado" class="block font-bold mb-2">Estado</label>
                    <Select
                        id="estado"
                        v-model="cliente.estado"
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
                <Button label="Guardar" icon="pi pi-check" @click="saveCliente" />
            </template>
        </Dialog>

        <!-- Dialog Confirmar Eliminar -->
        <Dialog
            v-model:visible="deleteClienteDialog"
            :style="{ width: '450px' }"
            header="Confirmar"
            :modal="true"
        >
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="cliente">
                    ¿Está seguro de eliminar el cliente <b>{{ cliente.nombre }}</b>?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteClienteDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="deleteCliente" />
            </template>
        </Dialog>
    </div>
</template>