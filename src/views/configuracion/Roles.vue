<script setup>
import { RolService } from '@/service/RolService';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const auth = useAuthStore();

const roles = ref([]);
const rol = ref({});
const loading = ref(false);
const guardando = ref(false);
const submitted = ref(false);
const errores = ref({});

const rolDialog = ref(false);
const eliminarDialog = ref(false);
const permisosDialog = ref(false);

const todosPermisos = ref([]);
const permisosSeleccionados = ref([]);
const cargandoPermisos = ref(false);

const puedeCrear = computed(() => auth.tienePermiso('roles.crear'));
const puedeEditar = computed(() => auth.tienePermiso('roles.editar'));
const puedeEliminar = computed(() => auth.tienePermiso('roles.eliminar'));

const esEdicion = computed(() => !!rol.value.id_rol);

// Agrupa los permisos por categoría para mostrarlos ordenados
const permisosAgrupados = computed(() => {
    const grupos = {};
    todosPermisos.value.forEach((p) => {
        (grupos[p.categoria] ||= []).push(p);
    });
    return Object.entries(grupos).map(([categoria, items]) => ({ categoria, items }));
});

// ============================================
// Cargar datos
// ============================================
async function cargarRoles() {
    loading.value = true;
    try {
        const response = await RolService.getRoles();
        roles.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudieron cargar los roles', life: 3000 });
    } finally {
        loading.value = false;
    }
}

async function cargarPermisos() {
    try {
        const response = await RolService.getPermisos();
        todosPermisos.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos', life: 3000 });
    }
}

onMounted(() => {
    cargarRoles();
    cargarPermisos();
});

// ============================================
// Crear / editar rol
// ============================================
function openNew() {
    rol.value = { nombre: '', descripcion: '', nivel: 1 };
    submitted.value = false;
    errores.value = {};
    rolDialog.value = true;
}

function editRol(row) {
    rol.value = { id_rol: row.id_rol, nombre: row.nombre, descripcion: row.descripcion, nivel: row.nivel };
    submitted.value = false;
    errores.value = {};
    rolDialog.value = true;
}

function errorCampo(campo, falta = false) {
    if (submitted.value && falta) return 'Este campo es obligatorio';
    return errores.value[campo]?.[0] || '';
}

async function saveRol() {
    submitted.value = true;
    errores.value = {};

    const r = rol.value;
    if (!r.nombre?.trim() || !r.descripcion?.trim() || !r.nivel) return;

    const payload = { nombre: r.nombre, descripcion: r.descripcion, nivel: r.nivel };

    guardando.value = true;
    try {
        if (esEdicion.value) {
            await RolService.updateRol(r.id_rol, payload);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado correctamente', life: 3000 });
        } else {
            await RolService.createRol(payload);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente', life: 3000 });
        }
        rolDialog.value = false;
        cargarRoles();
    } catch (error) {
        if (error.status === 422 && error.errors) {
            errores.value = error.errors;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo guardar el rol', life: 3000 });
        }
    } finally {
        guardando.value = false;
    }
}

// ============================================
// Eliminar rol
// ============================================
function confirmEliminar(row) {
    rol.value = row;
    eliminarDialog.value = true;
}

async function eliminarRol() {
    try {
        await RolService.deleteRol(rol.value.id_rol);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado correctamente', life: 3000 });
        eliminarDialog.value = false;
        cargarRoles();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'No se pudo eliminar', detail: error.message, life: 5000 });
        eliminarDialog.value = false;
    }
}

// ============================================
// Permisos del rol
// ============================================
async function abrirPermisos(row) {
    rol.value = row;
    permisosSeleccionados.value = [];
    permisosDialog.value = true;
    cargandoPermisos.value = true;
    try {
        const response = await RolService.getRol(row.id_rol);
        permisosSeleccionados.value = response.data.permisos_ids;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del rol', life: 3000 });
    } finally {
        cargandoPermisos.value = false;
    }
}

function marcarGrupo(grupo, marcar) {
    const ids = grupo.items.map((p) => p.id_permiso);
    if (marcar) {
        permisosSeleccionados.value = [...new Set([...permisosSeleccionados.value, ...ids])];
    } else {
        permisosSeleccionados.value = permisosSeleccionados.value.filter((id) => !ids.includes(id));
    }
}

async function guardarPermisos() {
    guardando.value = true;
    try {
        await RolService.syncPermisos(rol.value.id_rol, permisosSeleccionados.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Permisos actualizados correctamente', life: 3000 });
        permisosDialog.value = false;
        cargarRoles();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudieron guardar los permisos', life: 4000 });
    } finally {
        guardando.value = false;
    }
}
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button v-if="puedeCrear" label="Nuevo rol" icon="pi pi-plus" @click="openNew" />
            </template>
        </Toolbar>

        <DataTable :value="roles" dataKey="id_rol" :loading="loading">
            <template #header>
                <h4 class="m-0">Roles y permisos</h4>
            </template>
            <template #empty>No hay roles registrados.</template>

            <Column field="nombre" header="Rol" style="min-width: 12rem"></Column>
            <Column field="descripcion" header="Descripción" style="min-width: 18rem"></Column>
            <Column field="nivel" header="Nivel" style="min-width: 6rem"></Column>
            <Column field="permisos_count" header="Permisos" style="min-width: 7rem"></Column>
            <Column field="usuarios_count" header="Usuarios" style="min-width: 7rem"></Column>
            <Column :exportable="false" style="min-width: 12rem">
                <template #body="{ data }">
                    <Button v-if="puedeEditar" icon="pi pi-key" outlined rounded class="mr-2" v-tooltip.top="'Permisos'" @click="abrirPermisos(data)" />
                    <Button v-if="puedeEditar" icon="pi pi-pencil" outlined rounded class="mr-2" v-tooltip.top="'Editar'" @click="editRol(data)" />
                    <Button v-if="puedeEliminar" icon="pi pi-trash" outlined rounded severity="danger" v-tooltip.top="'Eliminar'" @click="confirmEliminar(data)" />
                </template>
            </Column>
        </DataTable>

        <!-- Crear / editar rol -->
        <Dialog v-model:visible="rolDialog" :style="{ width: '480px' }" :header="esEdicion ? 'Editar rol' : 'Nuevo rol'" modal>
            <div class="flex flex-col gap-4">
                <div>
                    <label for="nombre" class="block font-bold mb-2">Nombre *</label>
                    <InputText id="nombre" v-model.trim="rol.nombre" autofocus :invalid="!!errorCampo('nombre', !rol.nombre)" fluid />
                    <small v-if="errorCampo('nombre', !rol.nombre)" class="text-red-500">{{ errorCampo('nombre', !rol.nombre) }}</small>
                </div>
                <div>
                    <label for="descripcion" class="block font-bold mb-2">Descripción *</label>
                    <InputText id="descripcion" v-model.trim="rol.descripcion" :invalid="!!errorCampo('descripcion', !rol.descripcion)" fluid />
                    <small v-if="errorCampo('descripcion', !rol.descripcion)" class="text-red-500">{{ errorCampo('descripcion', !rol.descripcion) }}</small>
                </div>
                <div>
                    <label for="nivel" class="block font-bold mb-2">Nivel *</label>
                    <InputNumber id="nivel" v-model="rol.nivel" :min="1" :max="255" :invalid="!!errorCampo('nivel', !rol.nivel)" fluid />
                    <small v-if="errorCampo('nivel', !rol.nivel)" class="text-red-500">{{ errorCampo('nivel', !rol.nivel) }}</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="rolDialog = false" />
                <Button label="Guardar" icon="pi pi-check" :loading="guardando" @click="saveRol" />
            </template>
        </Dialog>

        <!-- Permisos del rol -->
        <Dialog v-model:visible="permisosDialog" :style="{ width: '650px' }" :header="`Permisos del rol: ${rol.nombre ?? ''}`" modal>
            <div v-if="cargandoPermisos" class="text-center py-6"><ProgressSpinner style="width: 40px; height: 40px" /></div>
            <div v-else class="flex flex-col gap-6">
                <div v-for="grupo in permisosAgrupados" :key="grupo.categoria">
                    <div class="flex items-center justify-between mb-2">
                        <h5 class="m-0 font-bold">{{ grupo.categoria }}</h5>
                        <div class="flex gap-2">
                            <Button label="Todos" size="small" text @click="marcarGrupo(grupo, true)" />
                            <Button label="Ninguno" size="small" text severity="secondary" @click="marcarGrupo(grupo, false)" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div v-for="p in grupo.items" :key="p.id_permiso" class="flex items-center gap-2">
                            <Checkbox v-model="permisosSeleccionados" :inputId="`perm-${p.id_permiso}`" :value="p.id_permiso" />
                            <label :for="`perm-${p.id_permiso}`" class="cursor-pointer">
                                {{ p.descripcion }}
                                <small class="text-muted-color block">{{ p.codigo }}</small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="permisosDialog = false" />
                <Button label="Guardar permisos" icon="pi pi-check" :loading="guardando" :disabled="cargandoPermisos" @click="guardarPermisos" />
            </template>
        </Dialog>

        <!-- Confirmar eliminar -->
        <Dialog v-model:visible="eliminarDialog" :style="{ width: '450px' }" header="Confirmar" modal>
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl!" />
                <span>¿Eliminar el rol <b>{{ rol.nombre }}</b>? Solo se puede eliminar si no tiene usuarios.</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="eliminarDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="eliminarRol" />
            </template>
        </Dialog>
    </div>
</template>