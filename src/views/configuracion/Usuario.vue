<script setup>
import { UsuarioService } from '@/service/UsuarioService';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const auth = useAuthStore();

const usuarios = ref([]);
const usuario = ref({});
const usuarioDialog = ref(false);
const desactivarDialog = ref(false);
const submitted = ref(false);
const guardando = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const errores = ref({}); // errores de validación que devuelve Laravel (422)

// Listas para los select del formulario
const roles = ref([]);
const regionales = ref([]);
const almacenes = ref([]);

const buscar = ref('');
const filtroEstado = ref(null);

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
const puedeCrear = computed(() => auth.tienePermiso('usuarios.crear'));
const puedeEditar = computed(() => auth.tienePermiso('usuarios.editar'));
const puedeDesactivar = computed(() => auth.tienePermiso('usuarios.eliminar'));

const esEdicion = computed(() => !!usuario.value.id_usuario);

// Solo muestra los almacenes de la regional elegida
const almacenesFiltrados = computed(() => almacenes.value.filter((a) => !usuario.value.id_regional || a.id_regional === usuario.value.id_regional));

function esUsuarioActual(row) {
    return row.id_usuario === auth.user?.id_usuario;
}

// ============================================
// Cargar datos
// ============================================
async function cargarUsuarios() {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            por_pagina: lazyParams.value.rows,
            buscar: buscar.value,
            estado: filtroEstado.value
        };

        if (lazyParams.value.sortField) {
            params.ordenar_por = lazyParams.value.sortField;
            params.direccion = lazyParams.value.sortOrder === 1 ? 'asc' : 'desc';
        }

        const response = await UsuarioService.getUsuarios(params);
        usuarios.value = response.data;
        totalRecords.value = response.meta.total;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudieron cargar los usuarios', life: 3000 });
    } finally {
        loading.value = false;
    }
}

async function cargarCatalogos() {
    try {
        const response = await UsuarioService.getCatalogos();
        roles.value = response.data.roles;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los roles',
            life: 3000,
        });
    }
}

onMounted(() => {
    cargarUsuarios();
    cargarCatalogos();
});

// ============================================
// Búsqueda, filtro, paginación y orden
// ============================================
let busquedaTimer = null;
function onBuscar() {
    clearTimeout(busquedaTimer);
    busquedaTimer = setTimeout(reiniciarYCargar, 400);
}

function onFiltroEstado() {
    reiniciarYCargar();
}

function reiniciarYCargar() {
    lazyParams.value.page = 1;
    lazyParams.value.first = 0;
    cargarUsuarios();
}

function onPage(event) {
    lazyParams.value.page = event.page + 1;
    lazyParams.value.rows = event.rows;
    lazyParams.value.first = event.first;
    cargarUsuarios();
}

function onSort(event) {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    cargarUsuarios();
}

// ============================================
// Formulario: crear / editar
// ============================================
function openNew() {
    usuario.value = {
        nombre: '',
        email: '',
        password: '',
        id_rol: null,
        id_regional: null,
        id_almacen: null,
        estado: 'activo'
    };
    submitted.value = false;
    errores.value = {};
    usuarioDialog.value = true;
}

function editUsuario(row) {
    usuario.value = { ...row, password: '' };
    submitted.value = false;
    errores.value = {};
    usuarioDialog.value = true;
}

function hideDialog() {
    usuarioDialog.value = false;
    submitted.value = false;
    errores.value = {};
}

function onCambioRegional() {
    usuario.value.id_almacen = null;
}

// Mensaje bajo cada campo: primero el del frontend, luego el del servidor
function errorCampo(campo, falta = false) {
    if (submitted.value && falta) return 'Este campo es obligatorio';
    return errores.value[campo]?.[0] || '';
}

async function saveUsuario() {
    submitted.value = true;
    errores.value = {};

    const u = usuario.value;
    if (!u.nombre?.trim() || !u.email?.trim() || !u.id_rol || (!esEdicion.value && !u.password)) {
        return;
    }

    const payload = {
        nombre: u.nombre,
        email: u.email,
        id_rol: u.id_rol,
        id_regional: u.id_regional,
        id_almacen: u.id_almacen,
        estado: u.estado
    };
    if (u.password) payload.password = u.password;

    guardando.value = true;
    try {
        if (esEdicion.value) {
            await UsuarioService.updateUsuario(u.id_usuario, payload);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente', life: 3000 });
        } else {
            await UsuarioService.createUsuario(payload);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente', life: 3000 });
        }

        hideDialog();
        usuario.value = {};
        cargarUsuarios();
    } catch (error) {
        if (error.status === 422 && error.errors) {
            errores.value = error.errors;
            toast.add({ severity: 'error', summary: 'Revisa los datos', detail: 'Hay campos con errores', life: 4000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo guardar el usuario', life: 3000 });
        }
    } finally {
        guardando.value = false;
    }
}

// ============================================
// Desactivar
// ============================================
function confirmDesactivar(row) {
    usuario.value = row;
    desactivarDialog.value = true;
}

async function desactivarUsuario() {
    try {
        await UsuarioService.desactivarUsuario(usuario.value.id_usuario);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario desactivado correctamente', life: 3000 });
        desactivarDialog.value = false;
        usuario.value = {};
        cargarUsuarios();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo desactivar el usuario', life: 3000 });
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
                <Button v-if="puedeCrear" label="Nuevo usuario" icon="pi pi-plus" class="mr-2" @click="openNew" />
            </template>
        </Toolbar>

        <DataTable
            :value="usuarios"
            dataKey="id_usuario"
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
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            @page="onPage"
            @sort="onSort"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Usuarios</h4>
                    <div class="flex flex-wrap gap-2">
                        <Select v-model="filtroEstado" :options="estados" optionLabel="label" optionValue="value" placeholder="Todos los estados" showClear @change="onFiltroEstado" />
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="buscar" placeholder="Buscar por nombre o correo..." @input="onBuscar" />
                        </IconField>
                    </div>
                </div>
            </template>

            <template #empty>No se encontraron usuarios.</template>

            <Column field="id_usuario" header="ID" sortable style="min-width: 5rem"></Column>
            <Column field="nombre" header="Nombre" sortable style="min-width: 14rem"></Column>
            <Column field="email" header="Correo" sortable style="min-width: 16rem"></Column>
            <Column header="Rol" style="min-width: 10rem">
                <template #body="{ data }">{{ data.rol?.nombre }}</template>
            </Column>
            <Column header="Regional" style="min-width: 9rem">
                <template #body="{ data }">{{ data.regional?.nombre ?? '—' }}</template>
            </Column>
            <Column header="Almacén" style="min-width: 9rem">
                <template #body="{ data }">{{ data.almacen?.nombre ?? '—' }}</template>
            </Column>
            <Column field="estado" header="Estado" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getEstadoSeverity(data.estado)" />
                </template>
            </Column>
            <Column :exportable="false" style="min-width: 9rem">
                <template #body="{ data }">
                    <Button v-if="puedeEditar" icon="pi pi-pencil" outlined rounded class="mr-2" v-tooltip.top="'Editar'" @click="editUsuario(data)" />
                    <Button v-if="puedeDesactivar && data.estado === 'activo' && !esUsuarioActual(data)" icon="pi pi-ban" outlined rounded severity="danger" v-tooltip.top="'Desactivar'" @click="confirmDesactivar(data)" />
                </template>
            </Column>
        </DataTable>

        <!-- Formulario crear / editar -->
        <Dialog
    v-model:visible="usuarioDialog"
    :style="{ width: '550px' }"
    :header="esEdicion ? 'Editar usuario' : 'Nuevo usuario'"
    modal
    :focusOnShow="false"
>
            <div class="flex flex-col gap-4">
                <div>
                    <label for="nombre" class="block font-bold mb-2">Nombre *</label>
                    <InputText id="nombre" v-model.trim="usuario.nombre" autofocus :invalid="!!errorCampo('nombre', !usuario.nombre)" fluid />
                    <small v-if="errorCampo('nombre', !usuario.nombre)" class="text-red-500">{{ errorCampo('nombre', !usuario.nombre) }}</small>
                </div>

                <div>
                    <label for="email" class="block font-bold mb-2">Correo electrónico *</label>
                    <InputText id="email" v-model.trim="usuario.email" type="email" :invalid="!!errorCampo('email', !usuario.email)" fluid />
                    <small v-if="errorCampo('email', !usuario.email)" class="text-red-500">{{ errorCampo('email', !usuario.email) }}</small>
                </div>

                <div>
                    <label for="password" class="block font-bold mb-2">Contraseña {{ esEdicion ? '' : '*' }}</label>
                    <Password id="password" v-model="usuario.password" :feedback="false" toggleMask autocomplete="new-password" :invalid="!!errorCampo('password', !esEdicion && !usuario.password)" fluid />
                    <small v-if="errorCampo('password', !esEdicion && !usuario.password)" class="text-red-500">{{ errorCampo('password', !esEdicion && !usuario.password) }}</small>
                    <small v-else class="text-muted-color">
                        {{ esEdicion ? 'Déjala vacía para no cambiarla.' : 'Mínimo 8 caracteres, con letras y números.' }}
                    </small>
                </div>

                <div>
                    <label for="rol" class="block font-bold mb-2">Rol *</label>
                    <Select id="rol" v-model="usuario.id_rol" :options="roles" optionLabel="nombre" optionValue="id_rol" placeholder="Seleccione un rol" :invalid="!!errorCampo('id_rol', !usuario.id_rol)" fluid />
                    <small v-if="errorCampo('id_rol', !usuario.id_rol)" class="text-red-500">{{ errorCampo('id_rol', !usuario.id_rol) }}</small>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="regional" class="block font-bold mb-2">Regional</label>
                        <Select id="regional" v-model="usuario.id_regional" :options="regionales" optionLabel="nombre" optionValue="id_regional" placeholder="Sin regional" showClear :invalid="!!errorCampo('id_regional')" fluid @change="onCambioRegional" />
                        <small v-if="errorCampo('id_regional')" class="text-red-500">{{ errorCampo('id_regional') }}</small>
                    </div>
                    <div>
                        <label for="almacen" class="block font-bold mb-2">Almacén</label>
                        <Select id="almacen" v-model="usuario.id_almacen" :options="almacenesFiltrados" optionLabel="nombre" optionValue="id_almacen" placeholder="Sin almacén" showClear :invalid="!!errorCampo('id_almacen')" fluid />
                        <small v-if="errorCampo('id_almacen')" class="text-red-500">{{ errorCampo('id_almacen') }}</small>
                    </div>
                </div>

                <div>
                    <label for="estado" class="block font-bold mb-2">Estado</label>
                    <Select id="estado" v-model="usuario.estado" :options="estados" optionLabel="label" optionValue="value" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" :loading="guardando" @click="saveUsuario" />
            </template>
        </Dialog>

        <!-- Confirmar desactivación -->
        <Dialog v-model:visible="desactivarDialog" :style="{ width: '450px' }" header="Confirmar" modal>
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span v-if="usuario">
                    ¿Desactivar al usuario <b>{{ usuario.nombre }}</b
                    >? No podrá iniciar sesión y se cerrarán sus sesiones activas.
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="desactivarDialog = false" />
                <Button label="Sí, desactivar" icon="pi pi-check" severity="danger" @click="desactivarUsuario" />
            </template>
        </Dialog>
    </div>
</template>